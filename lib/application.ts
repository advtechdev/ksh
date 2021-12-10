import * as Sentry from '@sentry/node'
import {
  getLibs,
  makeRelative
} from './loadCommands'
import {Context, initContext} from './context'
import {Settings, defaultSettings} from './settings'
import {ContextError, ErrorData} from './error'
import {
  sessionOptions
} from './mongo'

export type Handler<T, S extends Settings> = (data: T, context?: Context<S>) => void

export interface Command<S extends Settings> {
  handler: Handler<any, S>
  topic: string
}

export class App<S extends Settings> {
  private context?: Context<S>

  constructor(private settings: S) {}

  async init() {
    if (this.settings.autoLoadCommandsDirectory)
      this.loadCommands(this.settings.autoLoadCommandsDirectory)

    this.context = await initContext(this.settings)

    Sentry.init({
      dsn: this.settings.sentryDSN,
      environment: this.settings.environment,
      tracesSampleRate: 0,
    })

  }

  private reportError<E>(e: E, data?: ErrorData) {
    const scope = new Sentry.Scope()
    scope.setTag("ms", this.settings.environment)
    scope.setTag("command", data?.eventName)
    scope.setExtra("data", data?.data)
    Sentry.captureException(e, scope)
  }

  private loadCommands(directory: string) {
    let libs = getLibs(directory)
    libs = makeRelative(libs, __dirname)
    libs
      .map(async (l: string) => {
        const {topic, handler}: Command<S> = await import('./' + l)
        this.handle(topic, handler)
      })
  }

  handle<T>(eventName: string, handler: Handler<T, S>, transact = false) {
    if (!this.context)
      throw new ContextError("Theres no context available")

    this.context.broker.on(eventName, async (data: T, ack, nack) => {
      let dbSession = this.context!.repository.startSession()
      try {
        if (transact) {
          dbSession.startTransaction(sessionOptions)
        }

        handler(data, this.context)

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
        this.reportError(e, {eventName, data})
      }
    })
  }
  async start() {
    await this.context!.broker
      .setServiceName(
        this.settings!.serviceName!
      )
      .setRoute(
        this.settings!.brokerRoute!
      )
      .start()
  }

}
