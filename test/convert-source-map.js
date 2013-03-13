'use strict';
/*jshint asi: true */

var test = require('trap').test
  , generator = require('inline-source-map')
  , convert = require('..')


test('different formats', function (t) {

var gen = generator()
    .addMappings('foo.js', [{ original: { line: 2, column: 3 } , generated: { line: 5, column: 10 } }], { line: 5 })
    .addGeneratedMappings('bar.js', 'var a = 2;\nconsole.log(a)', { line: 23, column: 22 })
  , base64 = gen.base64Encode()
  , comment = gen.inlineMappingUrl()
  , json = '{"version":3,"file":"","sources":["foo.js","bar.js"],"names":[],"mappings":";;;;;;;;;UACG;;;;;;;;;;;;;;sBCDH;sBACA"}'

  t.equal(convert.fromComment(comment).toComment(), comment, 'comment -> comment')
  t.equal(convert.fromComment(comment).toBase64(), base64, 'comment -> base64')
  t.equal(convert.fromComment(comment).toJSON(), json, 'comment -> json')

  t.equal(convert.fromBase64(base64).toBase64(), base64, 'base64 -> base64')
  t.equal(convert.fromBase64(base64).toComment(), comment, 'base64 -> comment')
  t.equal(convert.fromBase64(base64).toJSON(), json, 'base64 -> json')
  
  t.equal(convert.fromJSON(json).toJSON(), json, 'json -> json')
  t.equal(convert.fromJSON(json).toBase64(), base64, 'json -> base64')
  t.equal(convert.fromJSON(json).toComment(), comment, 'json -> comment')
});
