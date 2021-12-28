export interface Settings {
  mongoURL: string
  autoLoadCommandsDirectory?: string
  brokerRoute: string
  brokerURL: string
  brokerPreFetchingPolicy: number
  brokerQuorumQueuesEnabled: boolean
  sentryDSN: string
  serviceName: string
  environment: string
}
