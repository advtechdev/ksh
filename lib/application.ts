import {EventEmitter} from 'events'
import {
  getLibs,
  makeRelative
} from './loadCommands'
import {Context, initContext} from './context'
import {Settings, defaultSettings} from './settings'

declare type Handler<T> = (data: T) => void

declare interface Command {
  handler: Handler<any>
  topic: string
}

export default class App extends EventEmitter {
  private cache = {}
  private engines = {}
  private context?: Context

  constructor(private settings: Settings = defaultSettings()) {
    super()
    this.init()
  }

  async init() {
    if (this.settings.autoLoadCommandsDirectory)
      this.loadCommands(this.settings.autoLoadCommandsDirectory)

    this.context = await initContext(this.settings)
  }

  loadCommands(directory: string) {
    let libs = getLibs(directory)
    libs = makeRelative(libs, __dirname)
    libs
      .filter(f => !/index/.test(f))
      .map(async (l: string) => {
        const {topic, handler}: Command = await import('./' + l)
        this.handle(topic, handler)
      })
  }

  handle<T>(eventName: string, handler: Handler<T>) {
    try {
      this.on(eventName, handler)
    } catch (e) {

    }
  }
  start() {}

}
