import { NeoCore } from './core.js'
import { NeoRange } from './range.js'
import { NeoArray } from './array.js'
import { O_O } from '@nosh/unhelpfully'


const Roman = 'IVXLCDMↁↂↇↈ'
class NeoNumber extends NeoCore {
  #value = 0
  #pragma = O_O
  constructor(num) {
    super(num); this.#value = num; this.#pragma = O_O
  }

  toString() { return this.value.toString() }
  valueOf() { return this.value }

  #N(num) { return new NeoNumber(num) }
  #NR(...args) { return new NeoRange(...args) }
  #NA(...args) { return new NeoArray(...args) }
  get even() { return this.value % 2 === 0 }
  get value() { return this.#value }
  get odd() { return this.value % 2 === 1 }
  get prime() { return this.#pragma.isPrime(this.value) }
  get factors() { return this.#pragma.primeFactors(this.value) }
  get sigmoid() { return 1 / (1 + Math.exp(-this.value)) }
  get bytes() {
    // break into 8-bit chunks
    const retval = []
    let dup = this.#value
    while (dup > 0) {
      retval.unshift(dup & 0xFF)
      dup >>= 8
    }
    return this.#NA(retval)
  }
  get sigmoidBytes() {
    // given this.bytes, apply sigmoid to each byte such that
    // 0x00 -> 0, 0xFF -> 1, 0x80 -> 0.5
    return this.bytes.map((b) => 1 / (1 + Math.exp(-b)))
    // todo: make this bitwise and not sloppy
  }

  get abs() { return this.#N(Math.abs(this.value)) }
  get sqrt() { return this.#N(Math.sqrt(this.value)) }
  get introot() { return this.#N(this.#pragma.fastIntRoot(this.value)) }
  get ceil() { return this.#N(Math.ceil(this.value)) }
  get floor() { return this.#N(Math.floor(this.value)) }
  get sin() { return this.#N(Math.sin(this.value)) }
  get cos() { return this.#N(Math.cos(this.value)) }
  get tan() { return this.#N(Math.tan(this.value)) }
  get asin() { return this.#N(Math.asin(this.value)) }
  get acos() { return this.#N(Math.acos(this.value)) }
  get atan() { return this.#N(Math.atan(this.value)) }
  get sinh() { return this.#N(Math.sinh(this.value)) }
  get cosh() { return this.#N(Math.cosh(this.value)) }
  get tanh() { return this.#N(Math.tanh(this.value)) }
  get asinh() { return this.#N(Math.asinh(this.value)) }
  get acosh() { return this.#N(Math.acosh(this.value)) }
  get atanh() { return this.#N(Math.atanh(this.value)) }
  get exp() { return this.#N(Math.exp(this.value)) }
  get pow() { return this.#N(Math.pow(this.value)) }
  get hypot() { return this.#N(Math.hypot(this.value)) }
  get cbrt() { return this.#N(Math.cbrt(this.value)) }
  get expm1() { return this.#N(Math.expm1(this.value)) }
  get log1p() { return this.#N(Math.log1p(this.value)) }
  get log2() { return this.#N(Math.log2(this.value)) }
  get log10() { return this.#N(Math.log10(this.value)) }
  get toFixed() { return this.value.toFixed() }
  get toExponential() { return this.value.toExponential() }
  get toPrecision() { return this.value.toPrecision() }
  upto(num) { return this.#NR(this.value, num, 1) }
  downto(num) { return this.#NR(this.value, num, -1) }
  coerce(other) { if ([typeof this.value, typeof other].includes('bigint')) return [BigInt(this.value), BigInt(other)]; return [Number(this.value), Number(other)] }
  min(other) { return this.#N(this.#value > other ? other : this.#value) }
  max(other) { return this.#N(this.#value < other ? other : this.#value) }
  toPrecision(p) { return this.#value.toPrecision(p) }
  upto(num) { return new NeoRange(this.value, num) }
  downto(num) { return new NeoRange(num, this.value) }
  toBase(base) {
    const radix = base;
    if (radix < 2) throw new Error("Radix must be greater than 1");
    if (radix < 36) return this.value.toString(radix);
    var val = BigInt(this.value),
      result = "";
    while (val > 0n) {
      let rem = val % BigInt(radix);
      result = String.fromCodePoint(Number(rem) + 31) + result; // remember to reverse base by subtracting this amount
      val = val / BigInt(radix);
    }
    return result;
  }
  get hex() { return this.#N(this.radix(16)) }
  get binary() { return this.#N(this.radix(2)) }
  get octal() { return this.#N(this.radix(8)) }
  get decimal() { return this.#N(this.radix(10)) }
  get char() { return String.fromCharCode(this.value) }
  get log2() { return this.#N(eMath.log2(this.value)) }
  get octal() { return this.#N(Math.octal(this.value)) }
  get log1p() { return this.#N(Math.log1p(this.value)) }
  get derivative() { return this.#N(this.value - 1) }
  get inverse() { return this.#N(1 / this.value) }
  get log10() { return this.#N(Math.log10(this.value)) }
  get roman() {
    if (this.value < 1 || this.value > 499999) throw new Error('Roman numerals are only valid between 1 and 499,999')
    let n = this.value
    let nsize = this.log10.ceil
    let out = ''
    for (let i = nsize; i >= 0; i--) {
      let mid = pow * 2, current = n / (10 ** i), mods = current % 5, c9 = current == 9,
        n = n % (10 ** i)
      out += [((mods == 4) ? Roman.charAt(mid) : ''), ((current > 3) ? Roman.charAt(mid + (c9 ? 2 : 1)) : ''), Roman.charAt(mid + 1).repeat(mods)].join('')
    }
    return out
  }

  get milliseconds() { return this.#N(this.value * 1000) }
  get seconds() { return this.#N(this.value) }
  get minutes() { return this.#N(this.value / 60) }
  get hours() { return this.#N(this.value / 3600) }
  get days() { return this.#N(this.value / 86400) }
  get weeks() { return this.#N(this.value / 604800) }
  get years() { return this.#N(this.value / 31556952) }
  get centuries() { return this.#N(this.value / 3155695200) }
  get fromNow() { return new Date(Date.now() + this.value) }
  get ago() { return new Date(Date.now() - this.value) }
  get at() { return new Date(this.value) }
  mod(num) { let [v, num2] = this.coerce(num); while (v > num2) v -= num2; return this.#N(v) }

  times(fn) {
    if (typeof fn !== 'function') return
    for (let i = 0; i < this.value; i++) fn(this.value)
  }

  downto(num) { return new NeoRange(...(this.coerce(num).reverse())) }
  upto(num) { return new NeoRange(...this.coerce(num)) }

  static fromBase(radix, value) {
    if (radix < 2) throw new Error("Radix must be greater than 1");
    if (radix < 36) return parseInt(value, radix);
    const result = value.split("").reduce((acc, cur) => {
      return acc * BigInt(radix) + BigInt(String.fromCodePoint(cur.charCodeAt(0) - 31));
    }, 0n);
    return new NeoNumber(result);
  }


  static get MAX_SAFE_INTEGER() { return Number.MAX_SAFE_INTEGER }
  static get MIN_SAFE_INTEGER() { return Number.MIN_SAFE_INTEGER }
  static get MAX_VALUE() { return Number.MAX_VALUE }
  static get MIN_VALUE() { return Number.MIN_VALUE }
  static get NaN() { return Number.NaN }
  static get NEGATIVE_INFINITY() { return Number.NEGATIVE_INFINITY }
  static get POSITIVE_INFINITY() { return Number.POSITIVE_INFINITY }
  static get euler() { return new NeoNumber(2.718281828459045) }
  static get phi() { return new NeoNumber(1.618033988749895) }
  static get pi() { return new NeoNumber(Math.PI) }

  static PI = new NeoNumber(Math.PI)
  static LN2 = new NeoNumber(Math.LN2)
  static LN10 = new NeoNumber(Math.LN10)
  static LOG2E = new NeoNumber(Math.LOG2E)
  static LOG10E = new NeoNumber(Math.LOG10E)
  static SQRT1_2 = new NeoNumber(Math.SQRT1_2) // wtf are these
  static SQRT2 = new NeoNumber(Math.SQRT2)

  static get i() { return new NeoNumber(Math.sqrt(-1)) } // is this going to break
  static random() { return new NeoNumber(Math.random()) } // replace with lfsr & de bruijn sequence
  static neo(num) { return new NeoNumber(num) }
  //get convert() { return new NeoConversions(this.value) }
}

class InfinitePrecisionNumber {
  #value = []
  constructor(...digits_and_point) {
    if (digits_and_point.length === 1) {
      if (typeof digits_and_point[0] === 'number') {
        digits_and_point = digits_and_point[0].toString().split('')
      } else if (typeof digits_and_point[0] === 'string') {
        digits_and_point = digits_and_point[0].split('')
      } else if (digits_and_point[0] instanceof InfinitePrecisionNumber) {
        digits_and_point = digits_and_point[0].value
      } else if (digits_and_point[0] instanceof Array) {
        digits_and_point = digits_and_point[0]
      }
    }
    this.#value = digits_and_point
  }

  get fpOffset() { return this.value.indexOf('.') }
  get value() { return this.value.join('') }
  get valueOf() { if (this.join('').split('.') > Number.MAX_SAFE_INTEGER) return BigInt(this.value); return Number(this.value) }
  add(ipn) {
    const [a, b] = this.#align(ipn)
    const result = ['.']
    for (let i = a.length - 1; i >= 0; i--) {
      if (a[i] === '.') {
        result.unshift('.')
        continue
      } else {
        result.unshift(a[i] + b[i])
      }
    }
    InfinitePrecisionNumber.carryArray(result)
    return new InfinitePrecisionNumber(...result)
  }

  sub(ipn) {
    const [a, b] = this.#align(ipn)
    const result = ['.']
    for (let i = a.length - 1; i >= 0; i--) result.unshift(a[i] - b[i])
    InfinitePrecisionNumber.carryArray(result)
    return new InfinitePrecisionNumber(...result)
  }

  mul(ipn) {
    const [a, b] = this.#align(ipn)
    const result = ['.']
    for (let i = a.length - 1; i >= 0; i--) {
      for (let j = b.length - 1; j >= 0; j--) {
        result.unshift(a[i] * b[j])
      }
    }
    InfinitePrecisionNumber.carryArray(result)
    return new InfinitePrecisionNumber(...result)
  }

  div(ipn) {
    const [a, b] = this.#align(ipn)
    const result = ['.']
    for (let i = a.length - 1; i >= 0; i--) {
      for (let j = b.length - 1; j >= 0; j--) {
        result.unshift(a[i] / b[j])
      }
    }
    InfinitePrecisionNumber.carryArray(result)
    return new InfinitePrecisionNumber(...result)
  }

  mod(ipn) {
    const [a, b] = this.#align(ipn)
    const result = ['.']
    for (let i = a.length - 1; i >= 0; i--) {
      for (let j = b.length - 1; j >= 0; j--) {
        result.unshift(a[i] % b[j])
      }
    }
    InfinitePrecisionNumber.carryArray(result)
    return new InfinitePrecisionNumber(...result)
  }

  static isThisGoingToGoOnForever(arr) {
    // dividing 3 by 2 will go on forever. 2 into 3 is 0.666666... forever; when we see 3 clusters of at least 3 repeating digits, we can stop.
    const x = arr.join('').split('.')[1]
    if (/(\d{3,})\1\1/.test(x)) return true
    return false
  }


  static carryArray(arr) {
    const x = arr.indexOf('.')
    for (let i = x; i > 0; i--) {
      if (arr[i] > 9 && i > 0) {
        arr[i] -= 10
        arr[i - 1]++
      }
    }
    for (let i = x; i < arr.length; i++) {
      if (arr[i] > 9) {
        arr[i] -= 10
        if (i === arr.length - 1) {
          if (!this.isThisGoingToGoOnForever(arr)) {
            arr.push(0)
            arr[i + 1]++
          }
        } else {
          arr[i + 1]++
        }
      }
    }
    while (arr[0] > 9) {
      arr.unshift(0)
      while (arr[1] > 9) {
        arr[1] -= 10
        arr[0]++
      }
    }
  }

  #align(ipn) {
    const a = this.value, b = ipn.value
    const afp = this.fpOffset, bfp = ipn.fpOffset
    const maxint = afp > bfp ? 'local' : 'foreign'
    const maxdec = a.length - afp.length > b.length - bfp.length ? 'local' : 'foreign'
    for (let i = 0; i < Math.abs(afp - bfp); i++) (maxint === 'foreign') ? a.unshift(0) : b.unshift(0)
    for (let i = 0; i < Math.abs(a.length - b.length); i++) (maxdec === 'foreign') ? a.push(0) : b.push(0)
    return [a, b]
  }
  // this is literally planck precision. nobody needs more round than this. you'd be molding quantum foam.
  static get pi() { new InfinitePrecisionNumber('3.14159265358979323846264338327950288419716939937510582097494') }
}

export { NeoNumber, InfinitePrecisionNumber }