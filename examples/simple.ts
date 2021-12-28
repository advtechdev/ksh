import {
  Settings,
  App,
  Command,
  Context,
  Handler,
  LogicError
} from '../dist/lib'

interface TestData {
  id: string
  name: string
  num: number
}

const run = async () => {
  const kshms = new App({
    mongoURL:
      'mongodb+srv://test:c6m7cgO6csDgXyLd@cluster0.ecfzp.mongodb.net/test?retryWrites=true&w=majority',
    brokerURL:
      'amqps://wyghynzc:ayzCLTouG0zp1aCptUX5UeN1G4qB7Tuy@albatross.rmq.cloudamqp.com/wyghynzc',
    sentryDSN:
      'https://1ac6e6aac05344cb93c564f1d6dcaee4@o998597.ingest.sentry.io/5992079',
    environment: 'dev',
    serviceName: 'tex',
    brokerRoute: 'test',
    brokerQuorumQueuesEnabled: false,
    brokerPreFetchingPolicy: 50
  })

  await kshms.init()

  kshms.handle<TestData>(
    'test',
    (data, ctx) => {
      ctx?.repository.db('test').collection('test').insertOne(data)

      data.id = ctx!.UUID()
      ctx?.log.info(`Testing the logger ${JSON.stringify(data)}`)
      ctx?.broker.publish({ topic: 'tested', content: data }, 'test')
    },
    true
  )

  kshms.handle<TestData>(
    'tested',
    (data, ctx) => {
      ctx?.repository.db('test').collection('tested').insertOne(data)

      data.id = ctx!.UUID()
      ctx?.log.info(`Tested the logger ${JSON.stringify(data)}`)
    },
    true
  )

  await kshms.start()
}

run()
