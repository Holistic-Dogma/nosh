const simpleresponse = ({ helpers }) => {
  helpers.log.info('tiptap.simpleresponse')
  return { message: 'Hello, world!' }
}

const TipTap = {
  response: { handler: simpleresponse, method: 'get', unauthenticated: true }
}
export { TipTap}