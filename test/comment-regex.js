'use strict';
/*jshint asi: true */

var test = require('tap').test
  , generator = require('inline-source-map')
  , convert = require('..')
  , rx = require('..').commentRegex
  , mapFileRx = require('..').mapFileCommentRegex

var sourceMap = 'sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlcyI6WyJmdW5jdGlvbiBmb28oKSB7XG4gY29uc29sZS5sb2coXCJoZWxsbyBJIGFtIGZvb1wiKTtcbiBjb25zb2xlLmxvZyhcIndobyBhcmUgeW91XCIpO1xufVxuXG5mb28oKTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSJ9';

function comment(prefix, suffix) {
  rx.lastIndex = 0;
  return rx.test(prefix + sourceMap + suffix)
}

function commentWithLargeSource(prefix, suffix) {
  var testString = prefix + sourceMap + suffix;
  return convert.removeComments(testString, true) !== testString;
}
var sourceMapPrefix = 'sourceMappingURL=data:application/json;charset';
var sourceMapSuffix = 'utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlcyI6WyJmdW5jdGlvbiBmb28oKSB7XG4gY29uc29sZS5sb2coXCJoZWxsbyBJIGFtIGZvb1wiKTtcbiBjb25zb2xlLmxvZyhcIndobyBhcmUgeW91XCIpO1xufVxuXG5mb28oKTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSJ9';

function commentWithCharSet(prefix, suffix, sep) {
  sep = sep || ':';
  rx.lastIndex = 0;
  return rx.test(prefix + sourceMapPrefix + sep + sourceMapSuffix + suffix)
}


function commentWithCharSetWithLargeSource(prefix, suffix, sep) {
  sep = sep || ':';
  var testString = prefix + sourceMapPrefix + sep + sourceMapSuffix + suffix;
  return convert.removeComments(testString, true) !== testString;
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
    t.ok(comment(x, ''), 'matches ' + x)
    t.ok(commentWithCharSet(x, ''), 'matches ' + x + ' with charset')
    t.ok(commentWithCharSet(x, '', '='), 'matches ' + x + ' with charset')
  });

  [
    ' @// @',
    ' @/* @',
  ].forEach(function (x) { t.ok(!comment(x, ''), 'should not match ' + x) })

  t.end()
})

test('remove comment old spec with a large source - @', function (t) {
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
     t.ok(commentWithLargeSource(x, ''), 'matches ' + x)
     t.ok(commentWithCharSetWithLargeSource(x, ''), 'matches ' + x + ' with charset')
     t.ok(commentWithCharSetWithLargeSource(x, '', '='), 'matches ' + x + ' with charset')
  });

  [
    ' @// @',
    ' @/* @',
  ].forEach(function (x) { t.ok(!commentWithLargeSource(x, ''), 'should not match ' + x) })

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
    t.ok(comment(x, ''), 'matches ' + x)
    t.ok(commentWithCharSet(x, ''), 'matches ' + x + ' with charset')
    t.ok(commentWithCharSet(x, '', '='), 'matches ' + x + ' with charset')
  });

  [
    ' #// #',
    ' #/* #',
  ].forEach(function (x) { t.ok(!comment(x, ''), 'should not match ' + x) })

  t.end()
})

test('remove comment regex new spec with a large source - #', function (t) {
  [
    '  //# ', // with leading spaces
    '\t//# ', // with leading tab
    '//# ',   // with leading text
    '/*# ',   // multi line style
    '  /*# ', // multi line style with leading spaces
    '\t/*# ', // multi line style with leading tab
    '/*# ',   // multi line style with leading text
  ].forEach(function (x) {
    t.ok(commentWithLargeSource(x, ''), 'matches ' + x)
    t.ok(commentWithCharSetWithLargeSource(x, ''), 'matches ' + x + ' with charset')
    t.ok(commentWithCharSetWithLargeSource(x, '', '='), 'matches ' + x + ' with charset')
  });

  [
    ' #// #',
    ' #/* #',
  ].forEach(function (x) { t.ok(!commentWithLargeSource(x, ''), 'should not match ' + x) })

  t.end()
})

function mapFileCommentWrap(s1, s2) {
  mapFileRx.lastIndex = 0;
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
