import Neo, { evolve } from '@nosh/neoclassical'
import { Logger } from 'logn'
import { O_O } from 'unhelpfully'
import { promisify } from 'util'


// why do i have 20 copies of this
const bruteForceRepoRoot = async () => {
  if (Bun.env.Nosh_AppDir) return Bun.env.Nosh_AppDir
  if (Bun.env.DIRENV_DIR) return Bun.env.DIRENV_DIR
  let dir = (await $`git rev-parse --show-toplevel 2>/dev/null`).text().trim()
  if (/\w+/.test(dir)) return dir
  dir = import.meta.dir
  dir = $`cd ${dir} && while [[ ! -d .nosh ]]; do cd ..; done && pwd`.text().trim()
  return dir
}

class Pragma {
  #appname = 'system'
  #logger = null
  constructor() { this.#appname = 'system' }
  get NeoArray() { return Neo.NeoArray }
  get NeoObject() { return Neo.NeoObject }
  get NeoString() { return Neo.NeoString }
  get NeoNumber() { return Neo.NeoNumber }
  get Case() { return Neo.Case }
  get Neo() { return Neo }
  get O_O() { return O_O }
  get fn() { return O_O.fn }
  get up() { return evolve }
  get uuid() { return Bun.randomUUIDv7 }
  get promisify() { return promisify }
  get repo() { return async () => await bruteForceRepoRoot() }
  set appname(name) { this.#appname = name }
  get logger() { return this.#logger ??= console.log }
  initLogger(app) {
    this.#logger = new Logger(app); this.#appname = app
  }
  get appname() { return this.#appname }
}

const pragma = new Pragma()

export { pragma }