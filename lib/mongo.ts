import { MongoClient, ReadConcern, ReadPreference, WriteConcern } from 'mongodb'
import log from './logger'
const logger = log()

export const sessionOptions = {
  readPreference: new ReadPreference('primary'),
  readConcern: new ReadConcern('local'),
  writeConcern: new WriteConcern('majority')
}

export const getConnection = async (url: string): Promise<MongoClient> => {
  const client = new MongoClient(url)
  try {
    // Connect the client to the server
    await client.connect()
    // Establish and verify connection
    await client.db('admin').command({ ping: 1 })
    logger.info('Connected successfully to server')
  } catch (e) {
    // Ensures that the client will close when you finish/error
    logger.error(e)
    await client.close()
  }

  return client
}

export { ClientSession } from 'mongodb'
