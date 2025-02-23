import { NeoCore } from "./core.js";
import { NeoArray } from "./array.js";
class NeoObject extends NeoCore {
  #value = Object.create(null);
  constructor(arg = undefined) {
    super(arg);
    this.#value = this.#objectify(arg);
  }

  #objectify(arg) {
    if (Array.isArray(arg) || NeoArray.isArray(arg) && arg.every((e) => NeoArray.isArray(e) && e.length === 2)) return NeoObject.fromEntries(arg)
    if (!arg) return Object.create(null);
    if (arg instanceof NeoObject) return arg.value;
    if (arg instanceof NeoArray) return Object.fromEntries(arg.entries);
    if (Array.isArray(arg) && arg.every((e) => typeof e !== 'object')) return Object.fromEntries(arg.map((e) => [e, 1]));
    if (arg instanceof Object) return arg;
    return Object.create({});
  }
  get keys() { return Object.keys(this.#value) }
  get values() { return Object.values(this.#value) }
  get entries() { (this.keys??[]).map((k) => [k, this.#value[k]]) }
  get length() { return this.keys.length }
  filter(fn) { return this.select(fn) }
  select(fn) { return NeoObject.fromEntries(Object.entries(this.#value).filter(([k, v]) => fn(k, v))) }
  reject(fn) { return NeoObject.fromEntries(Object.entries(this.#value).filter(([k, v]) => !fn(k, v))) }
  get compact() { return this.reject((k, v) => !v) }
  get inverse() { return NeoObject.fromEntries(this.entries.map(([k, v]) => [v, k])) }
  get random() { return NeoArray.from(this.entries).random }
  get ancestors() {
    const response = new NeoArray();
    response.push(this);
    while (Object.getPrototypeOf(response.last)) {
      response.push(Object.getPrototypeOf(response.last));
      response.push(Object.getPrototypeOf(response.last).constructor);
    }
    return response;
  }
  get methods() {
    return this.#NA(...new Set([this.ancestors.reduce((acc, cur) => acc.concat(Object.getOwnPropertyNames(cur).filter((k) => typeof cur[k] === 'function')), [])]))
  }

  static fromEntries(entries) {
    const newNO = new NeoObject();
    entries.forEach(([k, v]) => newNO[k] = v);
    return newNO;
  }

  static assign(...args) {
    const newNO = new NeoObject();
    args = new NeoArray(args).map((arg) => arg.entries).flat();
    args.forEach(([k, v]) => newNO[k] = v);
    return newNO;
  }
  static create(obj) {
    if (obj instanceof NeoObject) return obj;
    return new NeoObject(obj);
  }
  get proto() { return Object.getPrototypeOf(this) }
  get cons() { return this.constructor }
  #NO(args) { return new NeoObject(args) }
  #NA(args) { return new NeoArray(args) }
  get properties() { return this.#NA(...(this.ancestors.reduce((acc, cur) => acc.concat(Object.getOwnPropertyNames(cur).concat(Object.getOwnPropertySymbols(cur))), []))) }
  get methods() { return this.#NA(...(this.ancestors.reduce((acc, cur) => acc.concat(Object.getOwnPropertyNames(cur).filter((k) => typeof cur[k] === 'function')), []))) }
  map(fn) { return new NeoObject.fromEntries(this.entries.map(([k, v]) => [k, fn(k, v)])) }
  deleteValuesAt(...args) {
    args.forEach((k) => delete this[k]);
    return this;
  }

  without(...args) { return this.#NO(this).deleteValuesAt(...args) }
  valuesAt(...keys) { return this.#NA(...keys.map((k) => this[k])) }

  slice(...keys) { return this.#NO(this.entries.filter(([k, v]) => keys.includes(k))) }

  get random() { return this.entries.random }
  get compact() { return this.reject((k, v) => !v) }
  get length() { return this.keys.length }
  static assign(...args) {
    const newNO = new NeoObject();
    args = new NeoArray(args).map((arg) => arg.entries).flat()
    args.forEach(([k, v]) => newNO[k] = v)
    return newNO
  }
  get randomKey() { return this.keys.random }
  get randomEntry() { return this.entries.random }

  set #property([key, value]) { Object.defineProperty(this, key, { value, enumerable: true, writable: true, configurable: true }) }
  merge(obj) {
    if (NeoObject.isObject(obj)) {
      const nobj = new NeoObject(obj);
      nobj.keys.forEach((k) => {
        const isEntries = (this.keys.includes(k) && NeoObject.isObject(this[k]) && NeoObject.isObject(nobj[k]))
        isEntries ? (this[k].merge(nobj[k])) : (this[k] = nobj[k])
      })
    } else if (NeoArray.isArray(obj)) {
      if (obj.every((e) => NeoArray.isArray(e) && e.length === 2)) {
        obj = NeoObject.fromEntries(obj);
        this.merge(obj);
      } else if (obj.every((e) => typeof e === 'object')) {
        obj = new NeoObject(obj);
        this.merge(obj);
      } else {
        ctr = 0
        const entr = obj.reduce((s, i) => s.concat([0 + ctr, i]).concat([0 - ctr++, i]), [])
        this.merge(Object.fromEntries(entr))
      }
    } else {
      this.merge(new NeoObject(obj))
    }
    return this;
  }

  static isObject(obj) { return obj instanceof NeoObject || obj instanceof Object }
  get(key) { return this[key] }
  defineProperty(key, value) { return Object.defineProperty(this, key, { value }) }
  valueOf() { return this.#value }
  get json() { return JSON.stringify(this.#value) }
}

export { NeoObject };