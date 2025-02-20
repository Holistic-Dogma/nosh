/* Use this as your Bun.serve args */
import { Freebooter } from './bootloader'
import Bun, { $ } from 'bun'
import { O_O } from 'unhelpfully'
import { handleApiRequest, handleFSRouterRequest, NeoRequest } from './helpers'
import { botless } from './botless'

const Middleware = { botless }
const Starterware = {}
// put a config block in middleware and add a function that takes
// bunserver instance and request, and returns one of the following:
// { code: 200, type: "OK" } - allow (pass to next middleware)
// { code: 3xx-5xx, type: "Error" } - deny
// 'next' - pass to next middleware
const registerMiddleware = (name, middleware) => { Middleware[name] = middleware }
// Starterware is load-time included; use this to add single-run-at-boot middleware.
// some middleware configs are for @nosh/palatine; these are not included here, but loaded by the palatine plugin in bunfig.toml.
const registerStarter = (name, middleware) => { Starterware[name] = middleware }
class BunServer {
  #config = O_O.obj
  #bunconfig = O_O.obj
  #server = Bun.serve({ fetch: async () => { } })
  #middleware = []

  constructor(configdata) {
    this.#config = configdata
    this.#bunconfig = new Freebooter(configdata)
    this.trace('boot.initialize.completed')
  }

  get pathToRepo() { return this.#bunconfig.pathToRepo }
  get pathToApp() { return this.#config.appRoot ?? this.#bunconfig.pathToApp }
  get config() { return this.#bunconfig.config }
  get logger() { return this.#bunconfig.logger }
  trace(text, ...args) { try { this.logger.trace(`freebooter.server.${text}`, ...args) } catch (e) { console.log(`freebooter.server.${text}`, ...args) } }
  async preloadService() {
    this.trace('boot.preload.begin')
    await $`cd ${this.pathToApp}`
    await this.#bunconfig.loadAllRoutes()
    this.trace('boot.preload.end')
    return this
  }

  loadMiddleware() {
    this.loadStarterware()
    const mw = Object.keys(this.#config.middleware).filter(name => Middleware[name])
    mw.forEach(name => {
      this.trace('loaded.middleware', {name})
      this.#middleware.push(Middleware[name])
    })
  }

  loadStarterware() {
    const mw = Object.keys(this.#config.middleware).filter(name => Starterware[name])
    mw.forEach(name => {
      this.trace('loaded.starterware', {name})
      Starterware[name](this, this.#config.middleware[name])
    })
  }

  apiRouteFor(path) {
    const { defined } = this.#bunconfig.routes
    if (!path || !Array.isArray(defined) || defined.length === 0) return undefined
    this.trace('defined.routes', { defined })
    const _defined = defined.map((args) => {
      if (Array.isArray(args)) args = args[0]
      args.tokens = (args.path ?? '').split('/').filter(r => r.length) // remove initial or ending /
      return args
    })
    // reverse interpolate - find routes whose static components match their :prefixed components and have the same number of arguments.
    const parts = path.split('/').filter(r => r.length)
    // iterate over _defined until a path matches
    for (let apiroute of _defined) {
      const { tokens } = apiroute
      // match all routes on static segments. future improvements: support optionals, extensions, and glob routes.
      if (tokens.every((part, idx) => part.startsWith(':') || part == parts[idx])) return apiroute
    }
    return undefined
  }

  get pagerouter() { return this.#bunconfig.routes.pages }
  async statics() { return await this.#bunconfig.routes.static }
  async start() {
    this.logger.info('starting.service')
    await this.preloadService()
    await this.initServer()
  }

  async initServer() {
    const wconfig = this.#bunconfig.webConfig
    this.loadMiddleware()
    const statics = await this.statics()
    this.#server = Bun.serve({
      port: wconfig.port ?? 3000,
      host: wconfig.host ?? 'localhost',
      static: {
        ...statics,
        '/nosh/heartbeat': new Response('ok', { status: 200 }),
      },
      logger: this.logger.info,
      fetch: async (request) => {
        const req = new NeoRequest(request)
        const log = this.logger.withRequest(req)
        console.log('[SERVER] Fetching request', req.url)
        log.trace('request.start')
        const { pathname, searchParams } = new URL(req.url)
        const middleware = [...this.#middleware]
        while (middleware.length > 0) {
          const result = middleware.shift()(this, req)
          if (typeof result === 'string' && result === 'next') continue
          if (typeof result === 'object') {
            if (result.code === 200) continue
            log.warn('middleware.denied', { code: result.code, type: result.type })
            return new Response(result.type, { status: result.code })
          }
        }
        // is this an FS route, or is it defined as an api route?
        // API routes are slower to resolve, so we check them last
        const page_result = await handleFSRouterRequest(req, this.pagerouter)
        if (page_result) return page_result
        const api_route = this.apiRouteFor(pathname) // these can probably go into statics
        if (!api_route) return new Response('Not Found', { status: 404 })
        const response = await handleApiRequest(req, api_route)
        if (response instanceof Response) return response
        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
    })
  }
  get server() { return this.#server }
}

export { BunServer }