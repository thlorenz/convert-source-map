'use strict';
/*jshint asi: true */

var test = require('trap').test
  , generator = require('inline-source-map')
  , convert = require('..')


var gen = generator()
  .addMappings('foo.js', [{ original: { line: 2, column: 3 } , generated: { line: 5, column: 10 } }], { line: 5 })
  .addGeneratedMappings('bar.js', 'var a = 2;\nconsole.log(a)', { line: 23, column: 22 })
, base64 = gen.base64Encode()
, comment = gen.inlineMappingUrl()
, json = '{"version":3,"file":"","sources":["foo.js","bar.js"],"names":[],"mappings":";;;;;;;;;UACG;;;;;;;;;;;;;;sBCDH;sBACA"}'

test('different formats', function (t) {

  t.equal(convert.fromComment(comment).toComment(), comment, 'comment -> comment')
  t.equal(convert.fromComment(comment).toBase64(), base64, 'comment -> base64')
  t.equal(convert.fromComment(comment).toJSON(), json, 'comment -> json')

  t.equal(convert.fromBase64(base64).toBase64(), base64, 'base64 -> base64')
  t.equal(convert.fromBase64(base64).toComment(), comment, 'base64 -> comment')
  t.equal(convert.fromBase64(base64).toJSON(), json, 'base64 -> json')
  
  t.equal(convert.fromJSON(json).toJSON(), json, 'json -> json')
  t.equal(convert.fromJSON(json).toBase64(), base64, 'json -> base64')
  t.equal(convert.fromJSON(json).toComment(), comment, 'json -> comment')

})


test('from source', function (t) {
  var foo = '' + function foo() {
        console.log('hello I am foo');
        console.log('who are you');
      }
    + '\nfoo();\n'
  var map = '//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9vLmpzIiwic291cmNlcyI6WyJmdW5jdGlvbiBmb28oKSB7XG4gICAgY29uc29sZS5sb2coJ2hlbGxvIEkgYW0gZm9vJyk7XG4gICAgY29uc29sZS5sb2coJ3dobyBhcmUgeW91Jyk7XG4gIH0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEifQ=='

  function getComment(src) {
    return convert
      .fromFileContent(src)
      .toComment();
  }
  
  t.equal(getComment(foo + map), map, 'beginning of last line')
})

test('adding properties', function (t) {
  var mod = convert
    .fromJSON(json)
    .addProperty('foo', 'bar')
    .toJSON()    

  t.equal(
      mod
    , '{"version":3,"file":"","sources":["foo.js","bar.js"],"names":[],"mappings":";;;;;;;;;UACG;;;;;;;;;;;;;;sBCDH;sBACA","foo":"bar"}'
    , 'includes added property'
  )
})

test('setting properties', function (t) {
  var mod = convert
    .fromJSON(json)
    .setProperty('version', '2')
    .setProperty('mappings', ';;;UACG')
    .setProperty('should add', 'this')
    .toJSON()    

  t.equal(
      mod
    , '{"version":"2","file":"","sources":["foo.js","bar.js"],"names":[],"mappings":";;;UACG","should add":"this"}'
    , 'includes new property and changes existing properties'
  )
})
