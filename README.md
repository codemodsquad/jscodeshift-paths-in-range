# jscodeshift-paths-in-range

[![CircleCI](https://circleci.com/gh/codemodsquad/jscodeshift-paths-in-range.svg?style=svg)](https://circleci.com/gh/codemodsquad/jscodeshift-paths-in-range)
[![Coverage Status](https://codecov.io/gh/codemodsquad/jscodeshift-paths-in-range/branch/master/graph/badge.svg)](https://codecov.io/gh/codemodsquad/jscodeshift-paths-in-range)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/jscodeshift-paths-in-range.svg)](https://badge.fury.io/js/jscodeshift-paths-in-range)

A predicate for `jscodeshift` `Collection.filter` that only includes paths in the given source code range.
This is for building IDE codemod extensions that operate on the selected code/cursor position in an editor.

More specifically:

- If any paths are wholly contained within the range, use them (but not paths inside them)
- Otherwise, pick the topmost node that fully contains the range

### `pathsInRange(start: number, end: number = start)`

```js
import pathsInRange from 'jscodeshift-paths-in-range'
```

Returns a predicate for `Collection.filter`.

#### Arguments

- `start` - the index of the start of the range within the source code
- `end` - the index of the end of the range within the source code (defaults to `start`)

#### Example

```js
import jscodeshift from 'jscodeshift'
import pathsInRange from 'jscodeshift-paths-in-range'
const j = jscodeshift.withParser('babylon')

// editor is an example interface to a text editor in an IDE.
j(editor.getText())
  .find(j.ArrowFunctionExpression)
  .filter(
    pathsInRange(editor.getSelectedRange().start, editor.getSelectedRange().end)
  )
  .forEach(path => console.log(path.node))
```
