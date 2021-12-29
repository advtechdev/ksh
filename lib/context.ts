import { MongoClient } from 'mongodb'
import { v4 } from 'uuid'
import { Logger } from 'pino'
import { RMQ } from 'rmq.io'

export interface Context {
  readonly broker: RMQ
  readonly repository: MongoClient
  readonly UUID: typeof v4
  readonly log: Logger
}
