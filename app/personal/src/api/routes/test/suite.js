import { NeoArray } from '@nosh/neoclassical'
const backwards = async ({ helpers, pragma }) => {
  const { term } = helpers.req.params // needs :term in the url path
  const reverse = new NeoArray(term.split('')).reverse.join('').toString()
  return { reverse }
}

// this could be updated to use preflights for the required fields
const Test = { backwards: { handler: backwards, method: 'get', unauthenticated: true, noapikey: true }}
export { Test }