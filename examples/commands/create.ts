export const topic = 'createClient'

export const handler = async (body: unknown, context: unknown) => {
  console.log('body', body)
  console.log('context', context)
}
