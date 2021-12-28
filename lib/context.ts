import { MongoClient } from 'mongodb'
import { v4 } from 'uuid'
import { Logger } from 'pino'
import log from './logger'
import { RMQ, rmqio } from 'rmq.io'
import { getConnection } from './mongo'
import { Settings } from './settings'

export interface Context<S extends Settings> {
  readonly broker: RMQ
  readonly repository: MongoClient
  readonly UUID: typeof v4
  readonly log: Logger
  build?(settings: S): Context<S> | Promise<Context<S>>
}

export const initContext = async <S extends Settings>(
  s: Settings
): Promise<Context<S>> => {
  const dbConn = await getConnection(s.mongoURL)

  return {
    broker: rmqio({
      url: s.brokerURL || 'localhost',
      preFetchingPolicy: s.brokerPreFetchingPolicy || 50,
      quorumQueuesEnabled: s.brokerQuorumQueuesEnabled || false
    }),
    log: log(),
    UUID: v4,
    repository: dbConn
  }
}
