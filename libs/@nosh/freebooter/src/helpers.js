import { pragma } from './pragma'
import { isBot, blockUnsafe, botless } from './botless'
const { O_O } = pragma
import React from 'react'
import { renderToReadableStream } from 'react-dom/server'
// create helpers for a bun request

/* test string will be something like 'auth_id' or 'auth.id' or 'auth-id-token'.
that means to check:
  capitalized and lowercase headers: n-auth-id, N-Auth-Id, n_auth_id, N_Auth_Id
  query params: auth_id, auth:id, auth-id, auth.id, auth_id_token, auth-id-token, auth.id.token, authIdToken

    body: { auth: { id }, auth: { id: token }, auth: { id_token } }
    path params: /:auth_id or /:auth_id_token
  cookies: auth_id, auth_id_token, auth_id_token, auth.id.token, auth-id-token, auth:id:token, auth|id|token
*/


class NeoRequest {
  #request = {}
  #headers = {}
  #body = {}
  #url = {}
  matching_path = ''
  constructor(req, match_path = '') {
    this.#request = (req instanceof NeoRequest) ? req.originalRequest : req
    this.#headers = Object.fromEntries(this.#request.headers.entries())
    this.#body = (typeof this.#request.body === 'object') ? this.#request.body : (typeof this.#request.json === 'function') ? this.#request.json() : {}
    this.#url = NeoRequest.getURLComponents(this.#request.url)
    this.matching_path = match_path
  }
  get originalRequest() { return this.#request }
  get headers() { return this.#headers }
  get params() {
    if (!this.matching_path) return this.#url.params
    const tokens = this.matching_path.split('/').filter(r => r.length)
    const pathtokens = this.uri.path.split('/').filter(r => r.length)
    const retval = {}
    if (tokens.length !== pathtokens.length) return
    tokens.forEach((token, idx) => {
      if (token.startsWith(':')) retval[token.replace(':', '')] = pathtokens[idx]
    })
    return retval
  }
  get query() {
    const { querystring } = this.uri
    if (!querystring) return {}
    const response = {}
    const tokens = querystring.replace(/^\?/, '').split('&')
    tokens.forEach(token => {
      const [name, val] = token.split('=')
      if (/\[\]$/.match(name)) {
        // remove the [] from the name
        const name = name.replace(/([\[\]])+$/, '')
        response[name] ??= []
        response[name].push(val)
      } else response[name] = val
    })
    return response
  }
  get cookies() { return this.#request.cookies }
  get body() { return this.#body }
  get json() { return this.#request.json }
  get url() { return this.#request.url }
  get method() { return this.#request.method }
  get uri() { return this.#url }
  get path() { return this.uri.path }
  get host() { return this.uri.domain }
  get port() { return this.uri.port }
  get hash() { return this.uri.hash }
  get querystring() { return this.uri.querystring }
  get domain() { return this.uri.domain }
  get tld() { return this.uri.tld }
  get subdomain() { return this.uri.subdomain }
  get ip() { return this.#request.connection.remoteAddress }
  get protocol() { return this.#request.protocol }
  get secure() { return this.protocol === 'https' }
  get origin() { return this.headers.origin }
  get referer() { return this.headers.referer }
  get userAgent() { return this.headers['user-agent'] }
  get accept() { return this.headers.accept }
  get acceptLanguage() { return this.headers['accept-language'] }
  get acceptEncoding() { return this.headers['accept-encoding'] }
  get acceptCharset() { return this.headers['accept-charset'] }
  get acceptType() { return this.headers['accept-type'] }
  get auth() { return this.headers.authorization }
  static getURLComponents(urlstring) {
    const matches = urlstring.match(
      /^(?<protocol>\w+)\:\/+(?:(?<subdomain>[\w\-]+)\.)?(?<domain>[\w\-]+)\.?(?<tld>[^\:\/\?\#]+)?(?:\:(?<port>\d+)?)?(?<path>\/[^\?\#]*)?(?<querystring>\?[^\#]+)?(?<hash>\#.+)?$/
    )
    console.log(matches)
    return matches?.groups
  }
}

const test = (val) => (val !== null && val !== undefined && val !== '')
const { Case } = pragma

const multisource = (req, ...possible_keys) => {
  // body is appended to the request object and curried for the helper.
  let response = null
  const body = (typeof req.body === 'object') ? req.body : (typeof req.json === 'function') ? req.json() : {}
  const all_variations = possible_keys.filter(t => typeof t === 'string').map(k => Case.variations(k)).flat()
  while (response === null && all_variations.length > 0) {
    const t = all_variations.shift()
    if (!t || typeof t !== 'string' || t.length < 1) continue
    for (hdr of [t, `N-${t}`, `X-${t}`]) {
      if (test(req.headers[hdr])) return req.headers[hdr]
      if (test(req.headers[hdr.toLowerCase()])) return req.headers[hdr.toLowerCase()]
    }
    for (loc of ['params', 'query', 'cookies']) {
      if (test(req[loc]?.[t])) return req[loc][t]
    }
    if (test(body[t])) return body[t]
  }
  return null
}


const identify = (req) => {
  const ids = O_O.fn.obj
  const host_segments = req.host.split('.')
  const host = O_O.fn.obj
  if (host_segments.length > 3) {
    if (host_segments[host_segments.length - 2] == 'co') {
      const tld = host_segments.pop(), coco = host_segments.pop()
      host.tld = `${coco}.${tld}`
    } else {
      host.tld = host_segments.pop()
    }
    host.domain = host_segments.pop()
    host.subdomain = host_segments.join('.')
  }
  const appname = [host.subdomain, host.domain].join('-')
  ids.host = host
  ids.auth = multisource(req, 'auth', 'nauth', `${appname}-auth`, `${appname}-nauth`)
  ids.client = multisource(req, 'client', 'nclient', `${appname}-client`, `${appname}-nclient`)
  ids.user = multisource(req, 'user', 'nuser', `${appname}-user`, `${appname}-nuser`)
  ids.session = multisource(req, 'session', 'nsession', `${appname}-session`, `${appname}-nsession`)
  ids.request = multisource(req, 'request-id') ?? Bun.randomUUIDv7()
  ids.apikey = multisource(req, 'api key', 'apikey', 'utility-identifier')
  // todo: define a superuser key for higher-level access from configs
  return ids
}

class ResponseBuilder {
  #status = 200
  #message = 'response.complete'
  #data = Object.create({})
  constructor() {
    console.log('[RESPONSE] Generating Response Builder')
    this.#status = 200
    this.#message = 'response.complete'
    this.#data = {}
  }
  data(dobj) {
    if (typeof dobj !== 'object') return this.#data
    this.#data = Object.assign(this.#data, dobj)
    return this
  }
  status(stat) {
    this.#status = stat
    return this
  }

  message(msg) {
    this.#message = msg
    return this
  }

  get payload() {
    return { status: this.#status, message: this.#message, data: this.#data }
  }

  get response() { return new Response(JSON.stringify(this.payload), { headers: { 'Content-Type': 'text/json'}}) }
  get end() { return this.response }
}


// preflight checks are a way to ensure that the request has the necessary data to proceed
// you can set preflights in a few different ways to check for data in the request
// [[ 'exists', 'body', 'data', 'id' ],
// ['params', 'id']
// ['client-id', 'user-id', 'session-id'] // assumes an exist check on multisource
const PreflightLocations = ['params', 'query', 'body', 'headers', 'cookies', 'identifiers', 'multisource']
const preflightChecks = (req, preflights, idents) => {
  const validator = { success: true, errors: [], preflights: {} }
  if (!preflights || !Array.isArray(preflights)) return validator
  if (!Array.isArray(preflights[0])) preflights = [preflights] // ensure a nested array
  // iterate through each array of preflights
  preflights.forEach(keys => {
    var location = null
    if (keys[0] === 'exists') {
      // test for existence; this is the only test we're doing for now.
      // add validity or luhn-style tests later.
      keys.shift()
      if (PreflightLocations.includes(keys[0])) location = keys.shift()
      keys.forEach(key => {
        const keyval = ((!!location) ? req[location]?.[key] : idents[key]) ?? multisource(req, key)
        if (!keyval) validator.errors.push({ location, key, message: 'key not found' })
        validator.preflights[key] = keyval
      })
    }
  })
  validator.success = !validator.errors.length
  return validator
}

export const bruteForceAppRoot = async (req) => await pragma.repo ? pragma.repo : await pragma.findAppRoot(req) ?? null

const findNoshBin = async (req) => {
  if (Bun.which('nosh')) return Bun.which('nosh')
  if (!!process.env.Nosh_BinDir) return [process.env.Nosh_BinDir, 'nosh'].join('/')
  const approot = await bruteForceAppRoot(req)
  if (!approot) return null
  return [approot, '.nosh/bin/nosh'].join('/')
}

const reactRender = async (transitionalelement) => {
  return new Response( await renderToReadableStream(transitionalelement), { headers: { 'Content-Type': 'text/html' } })
}

const createHelpers = async (req) => {
  const identifiers = identify(req)
  const retval = {
    req,
    _nosh: await findNoshBin(req),
    nosh: async (cmd) => await $`${retval._nosh ?? 'nosh'} ${cmd}`.then(r => { return { text: r.text(), logout: r.stderr } }).catch(errors => ({ errors })),
    identifiers,
    multisource: O_O.fn.curry(multisource, req),
    log: pragma.logger.withRequest(req).withRequestId(identifiers.request),
    res: new ResponseBuilder(),
    success: new ResponseBuilder().status(200),
    error: new ResponseBuilder().status(500),
  }
  return retval
}

const handleApiRequest = async (request, requesthandlerdefintion) => {
  const req = new NeoRequest(request, requesthandlerdefintion.path)
  console.log('[API] Handling API Request')
  // expand request, do preflights, log, call endpoint, validate response
  const helpers = await createHelpers(req)
  const { handler, preflights, unauthenticated, noapikey, bots, cors } = requesthandlerdefintion
  if (cors && req.method === 'OPTIONS') return helpers.respond('ok')
  if (!cors && req.method === 'OPTIONS') return helpers.res.status(405).message('method not allowed').response
  if (!unauthenticated && !helpers.identifiers.auth) return helpers.res.status(401).message('unauthenticated request').response
  if (!noapikey && !helpers.identifiers.apikey) return helpers.res.status(401).message('unauthenticated api request').response
  if (bots && isBot(req)) return helpers.res.status(403).message('forbidden').response
  const pfvalidator = preflightChecks(req, preflights, helpers.identifiers)
  if (!pfvalidator.success) return helpers.res.status(400).message('bad request').data(pfvalidator).response
  if (blockUnsafe(req)) return helpers.res.status(403).message('forbidden').response
  helpers.log.info('request.start', { request: req })
  const response = await handler({ helpers, pragma, req, preflights: pfvalidator.preflights })
  if (!response) return helpers.res.status(500).message('internal server error').response
  if (!response instanceof Response && response instanceof Object) return helpers.res.status(200).data(response).response
  if (!response instanceof Response) return helpers.res.status(500).message('no response').response
  helpers.log.info('request.end', { response })
  return response
}

const layoutfiles = { root: null }


// first, let's try just a root tsx/jsx file in (route / filepath) + '_layout.[tj]sx'
const loadLayout = async (fsrouter, path='/') => {
  // get root path for fsrouter
  if (path == '/' && layoutfiles.root) return layoutfiles.root
  const root_path = fsrouter.match('/_layout').filePath
  return await import(root_path).then(modules => modules.default).catch(e => null)
}

const handleFSRouterRequest = async (req, fsrouter) => {
  const route = fsrouter.match(req.originalRequest)
  if (!route) return null
  pragma.logger.data({ route }).trace('fsrouter.route.found')
  const helpers = await createHelpers(req)
  const fileLoader = Bun.file(route.filePath)
  if (!fileLoader.exists) return helpers.res.status(404).message('not found').response
  if (route.src) {
    const handler = await import(route.filePath).then(modules => modules.default)
    if (typeof handler !== 'function') return helpers.res.status(500).message('internal.server.error').response
    const result = handler({ helpers, pragma, req, route })
    if (!result) return helpers.res.status(500).message('internal.server.error').response
    const layout = await loadLayout(fsrouter)
    layoutfiles.root ??= layout ?? Symbol.for('searched')
    if (layout === Symbol.for('searched') || typeof layout !== 'function') return await reactRender(result)
    const wrapped = layout({ helpers, pragma, req, route, children: result })
    return await reactRender(wrapped)
  } else {
    return new Response(fileLoader.read(), { headers: { 'Content-Type': fileLoader.mimetype } })
  }
}

export { handleApiRequest, handleFSRouterRequest, NeoRequest }