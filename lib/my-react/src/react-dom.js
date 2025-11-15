import { render as myRender, createRoot as myCreateRoot, createElement } from './index.js'

function isDom(node) {
  return node && (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
}

export function render(elementOrComponent, maybePropsOrContainer, maybeContainer) {
  let container
  let props = null

  if (isDom(maybeContainer)) {
    container = maybeContainer
    props = maybePropsOrContainer || null
  } else if (isDom(maybePropsOrContainer)) {
    container = maybePropsOrContainer
    props = null
  } else {
    throw new Error('Container is required for render')
  }

  let vnode = elementOrComponent
  if (typeof elementOrComponent === 'function') {
    vnode = createElement(elementOrComponent, props)
  }

  globalThis.__MY_REACT_ROOT__ = { vnode, container }
  myRender(vnode, container)
}

export function createRoot(container) {
  if (!container) throw new Error('Container is required for createRoot')
  return {
    render(vnodeOrComponent, maybeProps) {
      let vnode = vnodeOrComponent
      if (typeof vnodeOrComponent === 'function') {
        vnode = createElement(vnodeOrComponent, maybeProps || null)
      }
      globalThis.__MY_REACT_ROOT__ = { vnode, container }
      myRender(vnode, container)
    }
  }
}

export default { render, createRoot }
