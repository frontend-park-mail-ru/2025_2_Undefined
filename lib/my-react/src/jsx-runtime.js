import { createElement } from './index.js'

export function Fragment(props) {
  return props.children || []
}

function normalizeChildren(maybeChildren) {
  if (maybeChildren === undefined) return []
  if (Array.isArray(maybeChildren)) return maybeChildren
  return [maybeChildren]
}

export function jsx(type, props) {
  const { children, ...rest } = props || {}
  return createElement(type, rest, ...(normalizeChildren(children)))
}

export function jsxs(type, props) {
  return jsx(type, props)
}

export default { jsx, jsxs, Fragment }
