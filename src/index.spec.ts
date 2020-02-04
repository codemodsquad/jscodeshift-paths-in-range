/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import pathsToTransformFilter from './index'
import jscodeshift from 'jscodeshift'

import { pathsIntersectingRange } from './'

const j = jscodeshift.withParser('babylon')

describe(`pathsToTransformFilter`, function() {
  const code = `
const foo = () => {
  var toink
  const bar = () => {
    var blearck
  }
  var halb
  const baz = () => {
    var qlomb
    const blargh = () => {
      var gloob
    }
    var flamb
  }
  var nelm
  const qux = () => {

  }
}
var fildge
const qlob = () => {

}
var qlarmge
`

  const lambdas = j(code).find(j.ArrowFunctionExpression)

  it(`if any path are fully contained in the range, returns only the outermost ones`, function() {
    let nodes = lambdas
      .filter(
        pathsToTransformFilter(code.indexOf('toink'), code.indexOf('nelm'))
      )
      .nodes()
    expect(nodes.length).to.equal(2)
    expect(
      code.substring((nodes[0] as any).start, (nodes[0] as any).end)
    ).to.equal(
      `() => {
    var blearck
  }`
    )
    expect(
      code.substring((nodes[1] as any).start, (nodes[1] as any).end)
    ).to.equal(
      `() => {
    var qlomb
    const blargh = () => {
      var gloob
    }
    var flamb
  }`
    )
    nodes = lambdas
      .filter(
        pathsToTransformFilter(code.indexOf('qlomb'), code.indexOf('flamb'))
      )
      .nodes()
    expect(nodes.length).to.equal(1)
    expect(
      code.substring((nodes[0] as any).start, (nodes[0] as any).end)
    ).to.equal(
      `() => {
      var gloob
    }`
    )
  })
  it(`otherwise, returns the innermost path that fully contains the range`, function() {
    let nodes = lambdas
      .filter(
        pathsToTransformFilter(code.indexOf('qlomb'), code.indexOf('qlomb'))
      )
      .nodes()
    expect(nodes.length).to.equal(1)
    expect(
      code.substring((nodes[0] as any).start, (nodes[0] as any).end)
    ).to.equal(
      `() => {
    var qlomb
    const blargh = () => {
      var gloob
    }
    var flamb
  }`
    )
    nodes = lambdas
      .filter(
        pathsToTransformFilter(code.indexOf('gloob'), code.indexOf('gloob'))
      )
      .nodes()
    expect(nodes.length).to.equal(1)
    expect(
      code.substring((nodes[0] as any).start, (nodes[0] as any).end)
    ).to.equal(
      `() => {
      var gloob
    }`
    )
  })
})

describe(`pathsIntersectingRange`, function() {
  const code = `
const Comp = () => (
  <div>
    This is a
    <button>
      Test
    </button>
    <span />
  </div>
) 
`

  it('works', () => {
    const root = j(code)
    const elements = root
      .find(j.Node)
      .filter(
        path =>
          path.node.type !== 'JSXOpeningElement' &&
          path.node.type !== 'JSXClosingElement' &&
          (path.node.type === 'JSXElement' ||
            (path.parent && path.parent.node.type === 'JSXElement'))
      )
      .filter(
        pathsIntersectingRange(code.indexOf('is a'), code.indexOf('<span'))
      )
      .nodes()
    expect(elements[0].type).to.equal('JSXText')
    expect((elements[0] as any).value).to.match(/is a/)
    expect(elements[1].type).to.equal('JSXElement')
    expect(elements[2].type).to.equal('JSXText')
    expect((elements[2] as any).value).not.to.match(/\S/)
    expect(elements).to.have.lengthOf(3)
  })
})
