/* eslint-disable @typescript-eslint/no-explicit-any */

import { ASTPath, Node } from 'jscodeshift'

function* ancestorsOfPath<Node>(path: ASTPath<Node>): Iterable<ASTPath<Node>> {
  let { parentPath } = path
  while (parentPath != null) {
    yield parentPath
    parentPath = parentPath.parentPath
  }
}

export default function pathsInRange(
  start: number,
  end: number = start
): (path: ASTPath<Node>, i: number, paths: Array<ASTPath<Node>>) => boolean {
  let lastPaths: Array<ASTPath<Node>> | null = null
  let lastPathSet: Set<ASTPath<Node>> = new Set()

  function computePathSet(paths: Array<ASTPath<Node>>): Set<ASTPath<Node>> {
    // if any paths are wholly contained in the range, use those
    // (but not paths nested inside of them)
    const allFullyContained = paths.filter(
      path =>
        (path.value as any).start >= start && (path.value as any).end <= end
    )
    if (allFullyContained.length) {
      const allFullyContainedSet = new Set(allFullyContained)
      return new Set(
        allFullyContained.filter(path => {
          for (const ancestor of ancestorsOfPath(path)) {
            if (allFullyContainedSet.has(ancestor)) return false
          }
          return true
        })
      )
    }

    // return the bottommost path that fully contains the range
    const allFullContainers = paths.filter(
      path =>
        (path.value as any).start <= start && (path.value as any).end >= end
    )
    const fullContainersSet = new Set(allFullContainers)
    allFullContainers.forEach(path => {
      for (const ancestor of ancestorsOfPath(path)) {
        fullContainersSet.delete(ancestor)
      }
    })
    return fullContainersSet
  }

  return (
    path: ASTPath<Node>,
    index: number,
    paths: Array<ASTPath<Node>>
  ): boolean => {
    if (paths !== lastPaths) {
      lastPaths = paths
      lastPathSet = computePathSet(paths)
    }
    return lastPathSet.has(path)
  }
}

export function pathsIntersectingRange(
  start: number,
  end: number = start
): (path: ASTPath<Node>, i: number, paths: Array<ASTPath<Node>>) => boolean {
  let lastPaths: Array<ASTPath<Node>> | null = null
  let lastPathSet: Set<ASTPath<Node>> = new Set()

  function computePathSet(paths: Array<ASTPath<Node>>): Set<ASTPath<Node>> {
    const intersected = paths.filter((path: ASTPath<Node>): boolean => {
      const value: any = path.value
      return (
        value.start < end &&
        value.end > start &&
        (start <= value.start || end >= value.end)
      )
    })
    if (intersected.length) {
      const intersectedSet = new Set(intersected)
      return new Set(
        intersected.filter(path => {
          for (const ancestor of ancestorsOfPath(path)) {
            if (intersectedSet.has(ancestor)) return false
          }
          return true
        })
      )
    }

    // return the bottommost path that fully contains the range
    const allFullContainers = paths.filter(
      path =>
        (path.value as any).start <= start && (path.value as any).end >= end
    )
    const fullContainersSet = new Set(allFullContainers)
    allFullContainers.forEach(path => {
      for (const ancestor of ancestorsOfPath(path)) {
        fullContainersSet.delete(ancestor)
      }
    })
    return fullContainersSet
  }

  return (
    path: ASTPath<Node>,
    index: number,
    paths: Array<ASTPath<Node>>
  ): boolean => {
    if (paths !== lastPaths) {
      lastPaths = paths
      lastPathSet = computePathSet(paths)
    }
    return lastPathSet.has(path)
  }
}
