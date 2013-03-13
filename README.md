# convert-source-map [![build status](https://secure.travis-ci.org/thlorenz/convert-source-map.png)](http://travis-ci.org/thlorenz/convert-source-map)

Converts a source-map from/to  different formats and allows adding/changing properties.

## API

### fromObject(obj)

Returns source map converter from given object.

### fromJSON(json)

Returns source map converter from given json string.

### fromBase64(base64)

Returns source map converter from given base64 encoded json string.

### fromComment()

Returns source map converter from given base64 encoded json string prefixed with `//@ sourceMappintURL=...`.

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
