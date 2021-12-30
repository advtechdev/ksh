import { MongoClient } from 'mongodb'
import { Logger } from 'pino'
import { RMQ } from 'rmq.io'
import { v4 } from 'uuid'

export type Context<
  C extends Record<string, unknown> = Record<string, unknown>
> = Readonly<
  {
    broker: RMQ
    repository: MongoClient
    UUID: typeof v4
    log: Logger
  } & C
>
