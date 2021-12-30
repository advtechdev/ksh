import { App, Context } from '../dist'

const MONGO_URL = ''
const BROKER_URL = ''
const SENTRY_DSN = ''

interface TestData {
  id: string
  name: string
  num: number
}

export type CustomContext = {
  test: string
}

export type AppCustomContext = { test: string }
export type AppContext = Context<AppCustomContext>

const exampleWithCustomContext = async () => {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async ctx => ({
      test: 'test'
    })
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
