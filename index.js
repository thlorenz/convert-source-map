const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { Buffer } = require('node:buffer')

Object.defineProperty(exports, 'commentRegex', {
  get: function getCommentRegex () {
    return /^\s*\/(?:\/|\*)[@#]\s+sourceMappingURL=data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(?:.*)$/mg
  }
})

Object.defineProperty(exports, 'mapFileCommentRegex', {
  get: function getMapFileCommentRegex () {
    // Matches sourceMappingURL in either // or /* comment styles.
    return /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"`]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/){1}[ \t]*$)/mg
  }
})

/** @param {string} base64 */
function decodeBase64 (base64) {
  return (Buffer.from(base64, 'base64') || '').toString()
}

/** @param {string} sm */
function stripComment (sm) {
  return sm.split(',').pop()
}

/**
 * @param {string} sm
 * @param {string} dir
 */
function readFromFileMap (sm, dir) {
  // NOTE: this will only work on the server since it attempts to read the map file

  const r = exports.mapFileCommentRegex.exec(sm)

  // for some odd reason //# .. captures in 1 and /* .. */ in 2
  const filename = r[1] || r[2]
  const filepath = resolve(dir, filename)

  return readFileSync(filepath, 'utf8')
}

class Converter {
  constructor (sm, opts = {}) {
    if (opts.isFileComment) { sm = readFromFileMap(sm, opts.commentFileDir) }
    if (opts.hasComment) { sm = stripComment(sm) }
    if (opts.isEncoded) { sm = decodeBase64(sm) }
    if (opts.isJSON || opts.isEncoded) { sm = JSON.parse(sm) }

    this.sourcemap = sm
  }

  /** @param {number} [space] */
  toJSON (space) {
    return JSON.stringify(this.sourcemap, null, space)
  }

  toBase64 () {
    const json = this.toJSON()
    return (Buffer.from(json, 'utf8') || '').toString('base64')
  }

  /** @param {{ multiline?: boolean; }} options */
  toComment (options = {}) {
    const base64 = this.toBase64()
    const data = `sourceMappingURL=data:application/json;charset=utf-8;base64,${base64}`
    return options.multiline ? `/*# ${data} */` : `//# ${data}`;
  }

  // returns copy instead of original
  toObject () {
    return JSON.parse(this.toJSON())
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  addProperty (key, value) {
    if (this.sourcemap.hasOwnProperty(key)) { throw new Error(`property "${key}" already exists on the sourcemap, use set property instead`) }
    return this.setProperty(key, value)
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  setProperty (key, value) {
    this.sourcemap[key] = value
    return this
  }

  /** @param {string} key */
  getProperty (key) {
    return this.sourcemap[key]
  }
}

exports.fromObject = obj => {
  return new Converter(obj)
}

/** @param {string} json */
exports.fromJSON = json => {
  return new Converter(json, { isJSON: true })
}

/** @param {string} base64 */
exports.fromBase64 = base64 => {
  return new Converter(base64, { isEncoded: true })
}

/** @param {string} comment */
exports.fromComment = comment => {
  comment = comment
    .replace(/^\/\*/g, '//')
    .replace(/\*\/$/g, '')

  return new Converter(comment, { isEncoded: true, hasComment: true })
}

/**
 * @param {string} comment
 * @param {string} dir
 */
exports.fromMapFileComment = (comment, dir) => {
  return new Converter(comment, { commentFileDir: dir, isFileComment: true, isJSON: true })
}

// Finds last sourcemap comment in file or returns null if none was found
exports.fromSource = content => {
  const m = content.match(exports.commentRegex)
  return m ? exports.fromComment(m.pop()) : null
}

/**
 * Finds last sourcemap comment in file or returns null if none was found
 * @param {string} content
 * @param {string} dir
 */
exports.fromMapFileSource = (content, dir) => {
  const m = content.match(exports.mapFileCommentRegex)
  return m ? exports.fromMapFileComment(m.pop(), dir) : null
}

/** @param {string} src */
exports.removeComments = src => {
  return src.replace(exports.commentRegex, '')
}

/** @param {string} src */
exports.removeMapFileComments = src => {
  return src.replace(exports.mapFileCommentRegex, '')
}

/** @param {{ multiline?: boolean; }} options */
exports.generateMapFileComment = (file, options = {}) => {
  const data = `sourceMappingURL=${file}`
  return options.multiline ? `/*# ${data} */` : `//# ${data}`;
}
