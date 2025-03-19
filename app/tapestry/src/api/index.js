import { UserAuth } from './user/auth'
import { TipTap } from './tiptap'
const routes = []
const R = (path, options = { method: 'get'}) => {
  const method = options.method ?? 'get'
  routes.push({ ...options, method, path })
}

R('users/auth', UserAuth.validate)
R('tiptap', TipTap.response)