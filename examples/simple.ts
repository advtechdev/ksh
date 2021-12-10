import {
  Settings,
  App,
  Command,
  Context,
  Handler,
  LogicError
} from '../lib'


interface TestData {
  id: string
  name: string
  num: number
}

const run = async () => {

  const kshms = new App({
    mongoURL: "-",
    brokerURL: "-",
    sentryDSN: "-",
    environment: "dev",
    serviceName: "tex",
    brokerRoute: "test",
    brokerQuorumQueuesEnabled: false,
    brokerPreFetchingPolicy: 50
  })

  await kshms.init()

  kshms.handle<TestData>("test", (data, ctx) => {

    ctx?.repository
      .db("test")
      .collection("test")
      .insertOne(data)

    data.id = ctx!.UUID()
    ctx?.log.info(`Testing the logger ${JSON.stringify(data)}`)
    ctx?.broker.publish({topic: "tested", content: data}, "test")

  }, true)


  kshms.handle<TestData>("tested", (data, ctx) => {

    ctx?.repository
      .db("test")
      .collection("tested")
      .insertOne(data)

    data.id = ctx!.UUID()
    ctx?.log.info(`Tested the logger ${JSON.stringify(data)}`)

  }, true)

  await kshms.start()

}

run()
