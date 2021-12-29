import { rmqio } from 'rmq.io'
import { v4 } from 'uuid'
import { App, Context } from '../dist'
import { getConnection } from '../dist/mongo'
import log from '../dist/logger'

const MONGO_URL = ''
const BROKER_URL = ''
const SENTRY_DSN = ''

interface TestData {
  id: string
  name: string
  num: number
}

interface CustomContext extends Context {
  test: string
}

const exampleWithCustomContext = async () => {
  const repository = await getConnection(MONGO_URL)
  const customContext: CustomContext = {
    repository,
    broker: rmqio({
      url: BROKER_URL,
      preFetchingPolicy: 50,
      quorumQueuesEnabled: false
    }),
    log: log(),
    UUID: v4,
    test: 'test'
  }

  const kshms = new App(
    {
      mongoURL: MONGO_URL,
      brokerURL: BROKER_URL,
      sentryDSN: SENTRY_DSN,
      environment: 'dev',
      serviceName: 'tex',
      brokerRoute: 'test',
      brokerQuorumQueuesEnabled: false,
      brokerPreFetchingPolicy: 50
    },
    customContext
  )

  await kshms.config()

  kshms.handle<TestData>(
    'test',
    (data, ctx) => {
      ctx.repository.db('test').collection('test').insertOne(data)

      data.id = ctx.UUID()
      ctx.log.info(`Testing the logger ${JSON.stringify(data)}`)
      ctx.broker.publish({ topic: 'tested', content: data }, 'test')
    },
    true
  )

  kshms.handle<TestData>(
    'tested',
    (data, ctx) => {
      ctx.repository.db('test').collection('tested').insertOne(data)

      data.id = ctx.UUID()
      ctx.log.info(`Tested the logger ${JSON.stringify(data)}`)
    },
    true
  )

  await kshms.start()
}

exampleWithCustomContext()
