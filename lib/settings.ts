const D_AUTOLOADCOMMDIR = "commands"
const D_BROKERURL = "localhost"
const D_BROKERPREFETCH = 50
const D_BROKERQUORUMQUEUES = false
const D_MONGOURL = "mongodb://localhost:27017"


export interface Settings {
  mongoURL: string
  autoLoadCommandsDirectory?: string
  brokerURL?: string,
  brokerPreFetchingPolicy?: number,
  brokerQuorumQueuesEnabled?: boolean
}

export const defaultSettings: () => Settings = () => {
  return {
    mongoURL: D_MONGOURL,
    autoLoadCommandsDirectory: D_AUTOLOADCOMMDIR,
    brokerURL: D_BROKERURL,
    brokerPreFetchingPolicy: D_BROKERPREFETCH,
    brokerQuorumQueuesEnabled: D_BROKERQUORUMQUEUES
  }
}
