import * as Sentry from '@sentry/node'
import { rmqio } from 'rmq.io'
import { v4 } from 'uuid'

import { Context } from './context'
import { ContextError, ErrorData } from './error'
import { getLibs, makeRelative } from './loadCommands'
import log from './logger'
import { getConnection, sessionOptions } from './mongo'
import { Settings } from './settings'

export type Handler<T, C extends Context> = (
  data: T,
  context: C
) => Promise<void>

export type Command<C extends Context> = {
  handler: Handler<unknown, C>
  topic: string
}

export type CreateCustomContextFunction<C extends Record<string, unknown>> = (
  ctx: Context
) => Promise<C>

export class App<C extends Record<string, unknown>> {
  public context?: Context<C>

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private settings: Settings,
    private createCustomContext: CreateCustomContextFunction<C> = async () =>
      ({} as C)
  ) {}

  public async config() {
    if (this.settings.autoLoadCommandsDirectory)
      await this.loadCommands(this.settings.autoLoadCommandsDirectory)

    this.context = await this.initContext()

    Sentry.init({
      dsn: this.settings.sentryDSN,
      environment: this.settings.environment,
      tracesSampleRate: 0
    })
  }

  private reportError<E>(e: E, data?: ErrorData) {
    const scope = new Sentry.Scope()
    scope.setTag('ms', this.settings.environment)
    scope.setTag('command', data?.eventName)
    scope.setExtra('data', data?.data)
    Sentry.captureException(e, scope)
  }

  private async loadCommands(directory: string) {
    let libs = getLibs(directory)
    libs = makeRelative(libs, __dirname)
    await Promise.all(
      libs.map(async (l: string) => {
        const { topic, handler }: Command<Context<C>> = await import(`./${l}`)
        this.handle(topic, handler)
      })
    )
  }

  private async initContext(): Promise<Context<C>> {
    const dbConn = await getConnection(this.settings.mongoURL)

    const baseContext: Context = {
      broker: rmqio({
        url: this.settings.brokerURL,
        preFetchingPolicy: this.settings.brokerPreFetchingPolicy || 50,
        quorumQueuesEnabled: this.settings.brokerQuorumQueuesEnabled || false
      }),
      log: log(),
      UUID: v4,
      repository: dbConn
    }

    const customContext = await this.createCustomContext(baseContext)

    return {
      ...baseContext,
      ...customContext
    }
  }

  public handle<T>(
    eventName: string,
    handler: Handler<T, Context<C>>,
    transact = false
  ) {
    if (!this.context) throw new ContextError('Missing context')

    const context = this.context

    context.broker.on(eventName, async (data: T, ack, nack) => {
      const dbSession = context.repository.startSession()
      try {
        if (transact) dbSession.startTransaction(sessionOptions)

        await handler(data, context)

        if (transact) {
          await dbSession.commitTransaction()
          dbSession.endSession()
        }
        await ack()
      } catch (e) {
        if (transact) {
          await dbSession.abortTransaction()
          dbSession.endSession()
        }
        await nack()
        this.reportError(e, { eventName, data })
      }
    })
  }

  public async start() {
    if (!this.context) throw new ContextError('Missing context')

    await this.context.broker
      .setServiceName(this.settings.serviceName)
      .setRoute(this.settings.brokerRoute)
      .start()
  }
}
