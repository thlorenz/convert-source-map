'use strict';
/*jshint asi: true */

var test = require('tap').test
  , generator = require('inline-source-map')
  , convert = require('..')

function comment(prefix, suffix, rx) {
  return rx.exec(prefix + 'sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlcyI6WyJmdW5jdGlvbiBmb28oKSB7XG4gY29uc29sZS5sb2coXCJoZWxsbyBJIGFtIGZvb1wiKTtcbiBjb25zb2xlLmxvZyhcIndobyBhcmUgeW91XCIpO1xufVxuXG5mb28oKTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSJ9' + suffix)
}
function commentURI(prefix, suffix, rx) {
  return rx.exec(prefix + 'sourceMappingURL=data:application/json,%7B%22version%22%3A3%2C%22file%22%3A%22%22%2C%22sources%22%3A%5B%22function%20foo()%20%7B%0A%20console.log(%22hello%20I%20am%20foo%22)%3B%0A%20console.log(%22who%20are%20you%22)%3B%0A%7D%0A%0Afoo()%3B%0A%22%5D%2C%22names%22%3A%5B%5D%2C%22mappings%22%3A%22AAAA%22%7D' + suffix)
}

function commentWithCharSet(prefix, suffix, sep, rx) {
  sep = sep || ':';
  return rx.exec(prefix + 'sourceMappingURL=data:application/json;charset' + sep +'utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlcyI6WyJmdW5jdGlvbiBmb28oKSB7XG4gY29uc29sZS5sb2coXCJoZWxsbyBJIGFtIGZvb1wiKTtcbiBjb25zb2xlLmxvZyhcIndobyBhcmUgeW91XCIpO1xufVxuXG5mb28oKTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSJ9' + suffix)
}

function commentURIWithCharSet(prefix, suffix, sep, rx) {
  sep = sep || ':';
  return rx.exec(prefix + 'sourceMappingURL=data:application/json;charset' + sep +'utf-8,%7B%22version%22%3A3%2C%22file%22%3A%22%22%2C%22sources%22%3A%5B%22function%20foo()%20%7B%0A%20console.log(%22hello%20I%20am%20foo%22)%3B%0A%20console.log(%22who%20are%20you%22)%3B%0A%7D%0A%0Afoo()%3B%0A%22%5D%2C%22names%22%3A%5B%5D%2C%22mappings%22%3A%22AAAA%22%7D' + suffix)
}

function commentWithoutMediaType(prefix, suffix, rx) {
  return rx.exec(prefix + 'sourceMappingURL=data:;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlcyI6WyJmdW5jdGlvbiBmb28oKSB7XG4gY29uc29sZS5sb2coXCJoZWxsbyBJIGFtIGZvb1wiKTtcbiBjb25zb2xlLmxvZyhcIndobyBhcmUgeW91XCIpO1xufVxuXG5mb28oKTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSJ9' + suffix)
}

function commentURIWithoutMediaType(prefix, suffix, rx) {
  return rx.exec(prefix + 'sourceMappingURL=data:,%7B%22version%22%3A3%2C%22file%22%3A%22%22%2C%22sources%22%3A%5B%22function%20foo()%20%7B%0A%20console.log(%22hello%20I%20am%20foo%22)%3B%0A%20console.log(%22who%20are%20you%22)%3B%0A%7D%0A%0Afoo()%3B%0A%22%5D%2C%22names%22%3A%5B%5D%2C%22mappings%22%3A%22AAAA%22%7D' + suffix)
}

// Source Map v2 Tests
test('comment regex old spec - @', function (t) {
  [ 
    '//@ ',
    '  //@ ', // with leading space
    '\t//@ ', // with leading tab
    '//@ ',   // with leading text
    '/*@ ',   // multi line style
    '  /*@ ', // multi line style with leading spaces
    '\t/*@ ', // multi line style with leading tab
    '/*@ ',   // multi line style with leading text
  ].forEach(function (x) { 
    t.ok(comment(x, '', convert.commentRegex), 'matches ' + x)
    t.ok(comment(x, '', convert.commentRegex2), 'matches ' + x + ' (2)')
    t.ok(commentURI(x, '', convert.commentRegex2), 'matches ' + x + ' uri')
    t.ok(commentWithCharSet(x, '', undefined, convert.commentRegex), 'matches ' + x + ' with charset')
    t.ok(commentWithCharSet(x, '', '=', convert.commentRegex), 'matches ' + x + ' with charset')
    t.ok(commentWithCharSet(x, '', '=', convert.commentRegex2), 'matches ' + x + ' with charset (2)')
    t.ok(commentURIWithCharSet(x, '', '=', convert.commentRegex2), 'matches ' + x + ' uri with charset')
    t.ok(commentWithoutMediaType(x, '', convert.commentRegex2), 'matches ' + x + ' without media type (2)')
    t.ok(commentURIWithoutMediaType(x, '', convert.commentRegex2), 'matches ' + x + ' uri without media type')
  });

  [
    ' @// @',
    ' @/* @',
  ].forEach(function (x) {
    t.ok(!comment(x, '', convert.commentRegex), 'should not match ' + x)
    t.ok(!comment(x, '', convert.commentRegex2), 'should not match ' + x + ' (2)')
    t.ok(!commentURI(x, '', convert.commentRegex2), 'should not match ' + x + ' uri')
  })

  t.end()
})

test('comment regex new spec - #', function (t) {
  [ 
    '  //# ', // with leading spaces
    '\t//# ', // with leading tab
    '//# ',   // with leading text
    '/*# ',   // multi line style
    '  /*# ', // multi line style with leading spaces
    '\t/*# ', // multi line style with leading tab
    '/*# ',   // multi line style with leading text
  ].forEach(function (x) { 
    t.ok(comment(x, '', convert.commentRegex), 'matches ' + x)
    t.ok(comment(x, '', convert.commentRegex2), 'matches ' + x + ' (2)')
    t.ok(commentURI(x, '', convert.commentRegex2), 'matches ' + x + ' uri')
    t.ok(commentWithCharSet(x, '', undefined, convert.commentRegex), 'matches ' + x + ' with charset')
    t.ok(commentWithCharSet(x, '', '=', convert.commentRegex), 'matches ' + x + ' with charset')
    t.ok(commentWithCharSet(x, '', '=', convert.commentRegex2), 'matches ' + x + ' with charset (2)')
    t.ok(commentURIWithCharSet(x, '', '=', convert.commentRegex2), 'matches ' + x + ' uri with charset')
    t.ok(commentWithoutMediaType(x, '', convert.commentRegex2), 'matches ' + x + ' without media type (2)')
    t.ok(commentURIWithoutMediaType(x, '', convert.commentRegex2), 'matches ' + x + ' uri without media type')
  });
  
  [ 
    ' #// #',
    ' #/* #',
  ].forEach(function (x) {
    t.ok(!comment(x, '', convert.commentRegex), 'should not match ' + x)
    t.ok(!comment(x, '', convert.commentRegex2), 'should not match ' + x + ' (2)')
    t.ok(!commentURI(x, '', convert.commentRegex2), 'should not match ' + x + ' uri')
  })

  t.end()
})

test('comment regex groups', function (t) {
  [ 
    '  //# ', // with leading spaces
    '\t//# ', // with leading tab
    '//# ',   // with leading text
    '/*# ',   // multi line style
    '  /*# ', // multi line style with leading spaces
    '\t/*# ', // multi line style with leading tab
    '/*# ',   // multi line style with leading text
  ].forEach(function (x) {
    var m;
    m = comment(x, '', convert.commentRegex3)
    t.ok(m, 'matches ' + x)
    t.ok(m[0], 'comment')
    t.equal(m[1], 'application/json', 'media type')
    t.equal(m[2], 'application/json', 'MIME type')
    t.equal(m[3], undefined, 'undefined charset')
    t.equal(m[4], 'base64', 'base64 encoding')
    t.ok(m[5], 'data')
    m = commentURI(x, '', convert.commentRegex3)
    t.ok(m, 'matches ' + x + ' uri')
    t.ok(m[0], 'comment uri')
    t.equal(m[1], 'application/json', 'media type uri')
    t.equal(m[2], 'application/json', 'MIME type uri')
    t.equal(m[3], undefined, 'undefined charset uri')
    t.equal(m[4], undefined, 'undefined encoding uri')
    t.ok(m[5], 'data uri')
    m = commentWithCharSet(x, '', '=', convert.commentRegex3)
    t.ok(m, 'matches ' + x + ' with charset')
    t.ok(m[0], 'comment with charset')
    t.equal(m[1], 'application/json;charset=utf-8', 'media type with charset')
    t.equal(m[2], 'application/json', 'MIME type with charset')
    t.equal(m[3], 'utf-8', 'charset with utf-8')
    t.equal(m[4], 'base64', 'base64 encoding with charset')
    t.ok(m[5], 'data with charset')
    m = commentURIWithCharSet(x, '', '=', convert.commentRegex3)
    t.ok(m, 'matches ' + x + ' uri with charset')
    t.ok(m[0], 'comment uri with charset')
    t.equal(m[1], 'application/json;charset=utf-8', 'media type uri with charset')
    t.equal(m[2], 'application/json', 'MIME type uri with charset')
    t.equal(m[3], 'utf-8', 'charset uri with utf-8')
    t.equal(m[4], undefined, 'undefined encoding uri with charset')
    t.ok(m[5], 'data with charset')
    m = commentWithoutMediaType(x, '', convert.commentRegex3)
    t.ok(m, 'matches ' + x + ' without media type')
    t.ok(m[0], 'comment without media type')
    t.equal(m[1], undefined, 'undefined media type')
    t.equal(m[2], undefined, 'undefined MIME type')
    t.equal(m[3], undefined, 'undefined charset without media type')
    t.equal(m[4], 'base64', 'base64 encoding without media type')
    t.ok(m[5], 'data without media type')
    m = commentURIWithoutMediaType(x, '', convert.commentRegex3)
    t.ok(m, 'matches ' + x + ' uri without media type')
    t.ok(m[0], 'comment uri without media type')
    t.equal(m[1], undefined, 'undefined media type')
    t.equal(m[2], undefined, 'undefined MIME type')
    t.equal(m[3], undefined, 'undefined charset uri without media type')
    t.equal(m[4], undefined, 'undefined encoding uri without media type')
    t.ok(m[5], 'data uri without media type')
  });
  
  [ 
    ' #// #',
    ' #/* #',
  ].forEach(function (x) {
    t.ok(!comment(x, '', convert.commentRegex), 'should not match ' + x)
    t.ok(!comment(x, '', convert.commentRegex2), 'should not match ' + x + ' (2)')
    t.ok(!commentURI(x, '', convert.commentRegex2), 'should not match ' + x + ' uri')
  })

  t.end()
})

function mapFileCommentWrap(s1, s2) {
  var mapFileRx = convert.mapFileCommentRegex;
  return mapFileRx.test(s1 + 'sourceMappingURL=foo.js.map' + s2)
}

test('mapFileComment regex old spec - @', function (t) {

  [ 
    ['//@ ', ''],
    ['  //@ ', ''],                 // with leading spaces
    ['\t//@ ', ''],                 // with a leading tab
    ['///@ ', ''],                  // with a leading text
    [';//@ ', ''],                  // with a leading text
    ['return//@ ', ''],             // with a leading text
  ].forEach(function (x) { t.ok(mapFileCommentWrap(x[0], x[1]), 'matches ' + x.join(' :: ')) });

  [ 
    [' @// @', ''],
    ['var sm = `//@ ', '`'],        // not inside a string
    ['var sm = "//@ ', '"'],        // not inside a string
    ['var sm = \'//@ ', '\''],      // not inside a string
    ['var sm = \' //@ ', '\''],     // not inside a string
  ].forEach(function (x) { t.ok(!mapFileCommentWrap(x[0], x[1]), 'does not match ' + x.join(' :: ')) })
  t.end()
})

test('mapFileComment regex new spec - #', function (t) {
  [ 
    ['//# ', ''],
    ['  //# ', ''],                 // with leading space
    ['\t//# ', ''],                 // with leading tab
    ['///# ', ''],                  // with leading text
    [';//# ', ''],                  // with leading text
    ['return//# ', ''],             // with leading text
  ].forEach(function (x) { t.ok(mapFileCommentWrap(x[0], x[1]), 'matches ' + x.join(' :: ')) });

  [ 
    [' #// #', ''],
    ['var sm = `//# ', '`'],        // not inside a string
    ['var sm = "//# ', '"'],        // not inside a string
    ['var sm = \'//# ', '\''],      // not inside a string
    ['var sm = \' //# ', '\''],     // not inside a string
  ].forEach(function (x) { t.ok(!mapFileCommentWrap(x[0], x[1]), 'does not match ' + x.join(' :: ')) })
  t.end()
})

test('mapFileComment regex /* */ old spec - @', function (t) {
  [ [ '/*@ ', '*/' ]
  , ['  /*@ ', '  */ ' ]            // with leading spaces
  , [ '\t/*@ ', ' \t*/\t ']         // with a leading tab
  , [ 'leading string/*@ ', '*/' ]  // with a leading string
  , [ '/*@ ', ' \t*/\t ']           // with trailing whitespace
  ].forEach(function (x) { t.ok(mapFileCommentWrap(x[0], x[1]), 'matches ' + x.join(' :: ')) });

  [ ['/*@ ', ' */ */ ' ],       // not the last thing on its line 
    ['/*@ ', ' */ more text ' ] // not the last thing on its line 
  ].forEach(function (x) { t.ok(!mapFileCommentWrap(x[0], x[1]), 'does not match ' + x.join(' :: ')) });
  t.end()
})

test('mapFileComment regex /* */ new spec - #', function (t) {
  [ [ '/*# ', '*/' ]
  , ['  /*# ', '  */ ' ]            // with leading spaces
  , [ '\t/*# ', ' \t*/\t ']         // with a leading tab
  , [ 'leading string/*# ', '*/' ]  // with a leading string
  , [ '/*# ', ' \t*/\t ']           // with trailing whitespace
  ].forEach(function (x) { t.ok(mapFileCommentWrap(x[0], x[1]), 'matches ' + x.join(' :: ')) });

  [ ['/*# ', ' */ */ ' ],       // not the last thing on its line 
    ['/*# ', ' */ more text ' ] // not the last thing on its line 
  ].forEach(function (x) { t.ok(!mapFileCommentWrap(x[0], x[1]), 'does not match ' + x.join(' :: ')) });
  t.end()
})
