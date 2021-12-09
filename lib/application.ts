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

declare type Handler<T> = (data: T, context?: Context) => void

declare interface Command {
  handler: Handler<any>
  topic: string
}

export default class App {
  private context?: Context

  constructor(private settings: Settings = defaultSettings()) {
    this.init()
  }

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

  reportError<E>(e: E, data?: ErrorData) {
    const scope = new Sentry.Scope()
    scope.setTag("ms", this.settings.environment)
    scope.setTag("command", data?.eventName)
    scope.setExtra("data", data?.data)
    Sentry.captureException(e, scope)
  }

  loadCommands(directory: string) {
    let libs = getLibs(directory)
    libs = makeRelative(libs, __dirname)
    libs
      .map(async (l: string) => {
        const {topic, handler}: Command = await import('./' + l)
        this.handle(topic, handler)
      })
  }

  handle<T>(eventName: string, handler: Handler<T>, transact = false) {
    if (!this.context)
      throw new ContextError("Theres no context available")

    this.context.broker.on(eventName, async (data: T, ack, nack) => {
      let dbSession = this.context!.db.startSession()
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
  start() {}

}
