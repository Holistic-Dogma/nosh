//import { UserAuth } from './routes/user/auth'
import { Test } from './routes/test/suite'
const routes = []
const R = (path, options = { method: 'get'}) => {
  const method = options.method ?? 'get'
  routes.push({ ...options, method, path })
}

//R('users/auth', UserAuth.validate)
R('rev/:term', Test.backwards)
R('reverse/:term', Test.backwards)
export { routes }