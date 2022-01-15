# convert-source-map [![Build Status][ci-image]][ci-url]

Converts a source-map from/to  different formats and allows adding/changing properties.

```js
var convert = require('convert-source-map');

var json = convert
  .fromComment('//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQvZm9vLm1pbi5qcyIsInNvdXJjZXMiOlsic3JjL2Zvby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIvIn0=')
  .toJSON();

var modified = convert
  .fromComment('//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQvZm9vLm1pbi5qcyIsInNvdXJjZXMiOlsic3JjL2Zvby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIvIn0=')
  .setProperty('sources', [ 'SRC/FOO.JS' ])
  .toJSON();

console.log(json);
console.log(modified);
```

```json
{"version":3,"file":"build/foo.min.js","sources":["src/foo.js"],"names":[],"mappings":"AAAA","sourceRoot":"/"}
{"version":3,"file":"build/foo.min.js","sources":["SRC/FOO.JS"],"names":[],"mappings":"AAAA","sourceRoot":"/"}
```

## API

### fromObject(obj)

Returns source map converter from given object.

### fromJSON(json)

Returns source map converter from given json string.

### fromURI(uri)

Returns source map converter from given uri encoded json string.

### fromBase64(base64)

Returns source map converter from given base64 encoded json string.

### fromComment(comment)

Returns source map converter from given base64 or uri encoded json string prefixed with `//# sourceMappingURL=...`.

### fromMapFileComment(comment, mapFileDir, readMap)

Returns source map converter from given `filename` by parsing `//# sourceMappingURL=filename`.

`filename` must point to a file that is found inside the `mapFileDir`. Most tools store this file right next to the
generated file, i.e. the one containing the source map.

`readMap` must be a `function (filepath)`, which returns either a string with the source map read from the file synchronously, or a `Promise` if the source map will be read asynchronously. If `readMap` returns string, `fromMapFileComment` will return a source map converter and other methods from its interface will be chainable. If `readMap` returns a `Promise`, `fromMapFileComment` will return a `Promise` too and the next access to the source map converter will need to be handled asynchronously. The `Promise` will be either resolved with the source map converter or rejected with an error. The only method required from a `Promise` instance returned by `readMap` is `then(success, error)`; not the full standard.

For example, a synchronous way in Node.js:

```js
var convert = require('convert-source-map');
var fs = require('fs');

function readMap(filepath) {
  return fs.readFileSync(filepath, 'utf8');
}

var json = convert
  .fromMapFileComment('//# sourceMappingURL=map-file-comment.css.map', '.', readMap)
  .toJSON();
console.log(json);
```


For example, an asynchronous way in Node.js:

```js
var convert = require('convert-source-map');
var fs = require('fs');

function readMap(filepath) {
  return fs.readFile(filepath, 'utf8');
}

var converter = await convert.fromMapFileComment('//# sourceMappingURL=map-file-comment.css.map', '.', readMap)
var json = converter.toJSON();
console.log(json);
```

For example, an asynchronous way in the browser:

```js
var convert = require('convert-source-map');

function readMap(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = onreadystatechange;
    xhr.send(null)

    function onreadystatechange() {
      if (xhr.readyState !== 4 return;
      if (xhr.status === 200) resolve(xhr.responseText);
      else reject(new Error(xhr.statusText));
    }
  });
}

convert
  .fromMapFileComment('//# sourceMappingURL=map-file-comment.css.map', '/assets', readMap)
  .then(function (converter) {
    var json = converter.toJSON();
    console.log(json);
  }, function (error) {
    console.error(error);
  });
```

### fromSource(source)

Finds last sourcemap comment in file and returns source map converter or returns `null` if no source map comment was found.

### fromMapFileSource(source, mapFileDir, readMap)

Finds last sourcemap comment in file and returns source map converter or returns `null` if no source map comment was
found.

The sourcemap will be read from the map file found by parsing `# sourceMappingURL=file` comment. For more info see
fromMapFileComment.

### toObject()

Returns a copy of the underlying source map.

### toJSON([space])

Converts source map to json string. If `space` is given (optional), this will be passed to
[JSON.stringify](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify) when the
JSON string is generated.

### toURI()

Converts source map to uri encoded json string.

### toBase64()

Converts source map to base64 encoded json string.

### toComment([options])

Converts source map to an inline comment that can be appended to the source-file.

By default, the comment is formatted like: `//# sourceMappingURL=...`, which you would
normally see in a JS source file.

When `options.encoding == 'uri'`, the data will be uri encoded, otherwise they will be base64 encoded.

When `options.multiline == true`, the comment is formatted like: `/*# sourceMappingURL=... */`, which you would find in a CSS source file.

### addProperty(key, value)

Adds given property to the source map. Throws an error if property already exists.

### setProperty(key, value)

Sets given property to the source map. If property doesn't exist it is added, otherwise its value is updated.

### getProperty(key)

Gets given property of the source map.

### removeComments(src)

Returns `src` with all source map comments removed

### removeMapFileComments(src)

Returns `src` with all source map comments pointing to map files removed.

### commentRegex

Provides __a fresh__ RegExp each time it is accessed. Can be used to find source map comments.

Breaks down a source map comment into groups: Groups: 1: media type, 2: MIME type, 3: charset, 4: encoding, 5: data.

### mapFileCommentRegex

Provides __a fresh__ RegExp each time it is accessed. Can be used to find source map comments pointing to map files.

### generateMapFileComment(file, [options])

Returns a comment that links to an external source map via `file`.

By default, the comment is formatted like: `//# sourceMappingURL=...`, which you would normally see in a JS source file.

When `options.multiline == true`, the comment is formatted like: `/*# sourceMappingURL=... */`, which you would find in a CSS source file.

[ci-url]: https://github.com/thlorenz/convert-source-map/actions?query=workflow:ci
[ci-image]: https://img.shields.io/github/workflow/status/thlorenz/convert-source-map/CI?style=flat-square
