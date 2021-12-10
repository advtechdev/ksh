import {
  MongoClient,
} from "mongodb"
import {v4} from 'uuid'
import {Logger} from 'pino'
import log from './logger'
import {RMQ, rmqio} from 'rmq.io'
import {getConnection} from './mongo'
import {Settings} from './settings'

export interface Context {
  broker: RMQ
  repository: MongoClient
  UUID: typeof v4
  log: Logger
}

export const initContext = async (s: Settings): Promise<Context> => {
  const dbConn = await getConnection(s.mongoURL)
  return {
    broker: rmqio({
      url: s.brokerURL || "localhost",
      preFetchingPolicy: s.brokerPreFetchingPolicy || 50,
      quorumQueuesEnabled: s.brokerQuorumQueuesEnabled || false
    }),
    log: log(),
    UUID: v4,
    repository: dbConn
  }
}
