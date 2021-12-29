import * as Sentry from '@sentry/node'
import { v4 } from 'uuid'
import log from './logger'
import { rmqio } from 'rmq.io'

import { getLibs, makeRelative } from './loadCommands'
import { Context } from './context'
import { Settings } from './settings'
import { ContextError, ErrorData } from './error'
import { sessionOptions, getConnection } from './mongo'

export type Handler<T, C extends Context> = (data: T, context: C) => void

export interface Command<C extends Context> {
  handler: Handler<unknown, C>
  topic: string
}

export class App<C extends Context> {
  private context?: C

  constructor(private settings: Settings, context?: C) {
    if (context) this.context = context
  }

  public async config() {
    if (this.settings.autoLoadCommandsDirectory)
      await this.loadCommands(this.settings.autoLoadCommandsDirectory)

    if (!this.context) this.context = await this.initContext()

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
        const { topic, handler }: Command<C> = await import('./' + l)
        this.handle(topic, handler)
      })
    )
  }

  private async initContext() {
    const dbConn = await getConnection(this.settings.mongoURL)

    return {
      broker: rmqio({
        url: this.settings.brokerURL || 'localhost',
        preFetchingPolicy: this.settings.brokerPreFetchingPolicy || 50,
        quorumQueuesEnabled: this.settings.brokerQuorumQueuesEnabled || false
      }),
      log: log(),
      UUID: v4,
      repository: dbConn
    } as C
  }

  public handle<T>(
    eventName: string,
    handler: Handler<T, C>,
    transact = false
  ) {
    if (!this.context) throw new ContextError('Missing context')

    const context = this.context

    context.broker.on(eventName, async (data: T, ack, nack) => {
      const dbSession = context.repository.startSession()
      try {
        if (transact) dbSession.startTransaction(sessionOptions)

        handler(data, context)

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
