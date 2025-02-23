import { O_O } from '@nosh/unhelpfully'
import { bruteForceRepoRoot } from '@nosh/freebooter'
import lmdb from 'lmdb'
const rootDir = await bruteForceRepoRoot()

/* LMDB usage notes:
https://www.npmjs.com/package/lmdb
LMDB db.put and db.transaction are similar, but db.transaction -> put will require
the main JS thread to wait for the transaction to complete. db.put directly will instead
just execute in a separate worker thread. We also don't want to use async/await for db.put,
because a promise callback will delay the transaction commit until the promise is resolved.
We can always default to the sync configuration option to control the behavior of db.put.
*/

class NoKV {
  #database_path = ''
  #db = null
  #current = null
  #config = O_O.obj
  constructor(dbname, options = {}) {
    this.#config = { ...NoKV.defaultOptions, ...options }
    this.#database_path = `${rootDir}/data/db/${dbname}`
    const { compression, maxReaders, maxDbs } = this.#config
    this.#db = lmdb.open({ path: this.#database_path, compression, maxReaders, maxDbs })
    this.#current = this.#db.openDB()
    ['SIGINT', 'SIGTERM', 'SIGQUIT', 'beforeExit'].forEach(signal => process.on(signal, this.onTerminate.bind(this)))
  }

  use(dbschema)           { this.#current = this.#db.openDB(dbschema) }
  onTerminate()           { this.close() }
  async read(key)         { return await this.#current.get(key) }
  async write(key, value) { return await this.#current.put(key, value) }
  async delete(key)       { return await this.#current.del(key) }
  async clear()           { return await this.#current.clear() }
  async close()           { return await this.#db.close() }
  async keys(options = {}) {
    const { start, end, reverse, limit, offset, versions, snapshot } = options
    return await this.#current.getKeys({ start, end, reverse, limit, offset, versions, snapshot })
  }
  async values() { return await this.#current.values() }
  async entries() { return await this.#current.entries() }
  async destroyDB(fnreturningtrue=(()=>false)) { this.#db.close().then(() => fnreturningtrue() && this.#db.drop()) }
  async ensure() { return await this.#db.getLastVersion() }
  // todo: wrap other lmdb methods in cleaner method calls.
  static get defaultOptions() { return { compression: true, maxReaders: 126, maxDbs: 12 } }

  // cbor requires cbor-x
  static dataStorageTypes() { ['msgpack', 'json', 'string', 'cbor', 'binary', 'ordered-binary'] }



}

export { NoKV }