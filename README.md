# convert-source-map [![build status](https://secure.travis-ci.org/thlorenz/convert-source-map.png)](http://travis-ci.org/thlorenz/convert-source-map)

Converts a source-map from/to  different formats and allows adding/changing properties.

```js
var convert = require('convert-source-map');

var json = convert
  .fromComment('//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9vLmpzIiwic291cmNlcyI6WyJjb25zb2xlLmxvZyhcImhpXCIpOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIvIn0=')
  .toJSON();

var modified = convert
  .fromComment('//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9vLmpzIiwic291cmNlcyI6WyJjb25zb2xlLmxvZyhcImhpXCIpOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIvIn0=')
  .setProperty('sources', [ 'CONSOLE.LOG("HI");' ])
  .toJSON();

console.log(json);
console.log(modified);
```

```json
{"version":3,"file":"foo.js","sources":["console.log(\"hi\");"],"names":[],"mappings":"AAAA","sourceRoot":"/"}
{"version":3,"file":"foo.js","sources":["CONSOLE.LOG(\"HI\");"],"names":[],"mappings":"AAAA","sourceRoot":"/"}
```

## API

### fromObject(obj)

Returns source map converter from given object.

### fromJSON(json)

Returns source map converter from given json string.

### fromBase64(base64)

Returns source map converter from given base64 encoded json string.

### fromComment()

Returns source map converter from given base64 encoded json string prefixed with `//@ sourceMappintURL=...`.

### fromSource()

Finds last sourcemap comment in file and returns source map converter or returns null if no source map comment was
found.

### toJSON()

Converts source map to json string.

### toBase64()

Converts source map to base64 encoded json string.

### toComment()

Converts source map to base64 encoded json string prefixed with `//@ sourceMappintURL=...`.

### addProperty(key, value)

Adds given property to the source map. Throws an error if property already exists.

### setProperty(key, value)

Sets given property to the source map. If property doesn't exist it is added, otherwise its value is updated.

### removeComments(src)

Returns `src` with all source map comments removed
