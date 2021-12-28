const D_AUTOLOADCOMMDIR = 'commands'
const D_BROKERROUTE = 'test'
const D_BROKERURL = 'localhost'
const D_BROKERPREFETCH = 50
const D_BROKERQUORUMQUEUES = false
const D_MONGOURL = 'mongodb://localhost:27017'
const D_SERVICENAME = 'none'
const D_ENV = 'development'

export interface Settings {
  mongoURL: string
  autoLoadCommandsDirectory?: string
  brokerRoute?: string
  brokerURL?: string
  brokerPreFetchingPolicy?: number
  brokerQuorumQueuesEnabled?: boolean
  sentryDSN?: string
  serviceName?: string
  environment?: string
}

export const defaultSettings: () => Settings = () => {
  return {
    mongoURL: D_MONGOURL,
    autoLoadCommandsDirectory: D_AUTOLOADCOMMDIR,
    brokerURL: D_BROKERURL,
    brokerPreFetchingPolicy: D_BROKERPREFETCH,
    brokerQuorumQueuesEnabled: D_BROKERQUORUMQUEUES,
    serviceName: D_SERVICENAME,
    environment: D_ENV,
    brokerRoute: D_BROKERROUTE
  }
}
