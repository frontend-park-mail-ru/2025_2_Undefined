
export function createElement(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: (children || []).flat().filter(c => c !== undefined && c !== null)
  }
}


function setProps(dom, props) {
  props = props || {}
  dom.__handlers = dom.__handlers || {}
  Object.keys(props).forEach(name => {
    if (name === 'children') return
    if (name === 'ref') return
    
    // Обработка boolean атрибутов
    if (name === 'disabled' || name === 'checked' || name === 'selected' || name === 'readonly') {
      if (props[name]) {
        dom.setAttribute(name, '')
      } else {
        dom.removeAttribute(name)
      }
      return
    }
    
    if (name.startsWith('on') && typeof props[name] === 'function') {
      const event = name.slice(2).toLowerCase()
      // remove previous handler if any
      if (dom.__handlers[event]) dom.removeEventListener(event, dom.__handlers[event])
      dom.addEventListener(event, props[name])
      dom.__handlers[event] = props[name]
    } else if (name === 'style' && typeof props[name] === 'object') {
      Object.assign(dom.style, props[name])
    } else {
      dom.setAttribute(name, props[name])
    }
  })
  dom.__vnodeProps = props
}

export function render(vnode, container) {
  currentHook = 0
  if (!container.__vnode) {
    container.appendChild(_render(vnode))
  } else {
    const existing = container.firstChild
    if (existing) {
      updateElement(existing, vnode)
    } else {
      container.appendChild(_render(vnode))
    }
  }
  container.__vnode = vnode
  if (globalThis.__MY_REACT_ROOT__) globalThis.__MY_REACT_ROOT__.vnode = vnode
  runEffects()
}

function _render(vnode) {
  if (vnode == null || vnode === false) return document.createTextNode('')
  if (typeof vnode === 'string' || typeof vnode === 'number') return document.createTextNode(String(vnode))

  if (typeof vnode.type === 'function') {
    const componentVNode = vnode.type({ ...vnode.props, children: vnode.children })
    return _render(componentVNode)
  }

  const dom = document.createElement(vnode.type)
  setProps(dom, vnode.props)
  const ref = vnode.props && vnode.props.ref
  if (ref) {
    if (typeof ref === 'function') ref(dom)
    else if (typeof ref === 'object') {
      try { ref.current = dom } catch (e) {}
    }
  }
  ;(vnode.children || []).forEach(child => dom.appendChild(_render(child)))
  return dom
}

let hooks = []
let currentHook = 0
let pendingEffects = []

export function useState(initial) {
  const hookIndex = currentHook
  hooks[hookIndex] = hooks[hookIndex] || initial

  function setState(newVal) {
    hooks[hookIndex] = typeof newVal === 'function' ? newVal(hooks[hookIndex]) : newVal
    if (globalThis.__MY_REACT_ROOT__) {
      render(globalThis.__MY_REACT_ROOT__.vnode, globalThis.__MY_REACT_ROOT__.container)
    }
  }

  currentHook++
  return [hooks[hookIndex], setState]
}

export function useRef(initial = null) {
  const hookIndex = currentHook
  if (!hooks[hookIndex]) hooks[hookIndex] = { current: initial }
  const ref = hooks[hookIndex]
  currentHook++
  return ref
}

export function useEffect(effect, deps) {
  const hookIndex = currentHook
  const old = hooks[hookIndex]
  let hasChanged = true

  if (old && old.deps) {
    const oldDeps = old.deps
    if (deps && oldDeps && deps.length === oldDeps.length) {
      hasChanged = deps.some((d, i) => !Object.is(d, oldDeps[i]))
      hasChanged = hasChanged
    } else {
      hasChanged = true
    }
  }

  if (!old || deps === undefined || hasChanged) {
    pendingEffects.push({ hookIndex, effect, deps })
  }

  hooks[hookIndex] = { deps: deps, cleanup: old && old.cleanup }
  currentHook++
}

export function createRoot(vnode, container) {
  globalThis.__MY_REACT_ROOT__ = { vnode, container }
  currentHook = 0
  render(vnode, container)
}

function runEffects() {
  const queue = pendingEffects.slice()
  pendingEffects = []
  queue.forEach(({ hookIndex, effect, deps }) => {
    try {
      const old = hooks[hookIndex]
      if (old && typeof old.cleanup === 'function') {
        try { old.cleanup() } catch (e) {}
      }
      const cleanup = effect()
      hooks[hookIndex] = { deps, cleanup }
    } catch (e) {
      console.error('Effect error:', e)
    }
  })
}

function isTextVNode(vnode) {
  return typeof vnode === 'string' || typeof vnode === 'number'
}

function updateElement(dom, vnode) {
  if (isTextVNode(vnode)) {
    if (dom.nodeType === Node.TEXT_NODE) {
      const text = String(vnode)
      if (dom.nodeValue !== text) dom.nodeValue = text
      return
    } else {
      const newDom = _render(vnode)
      dom.parentNode.replaceChild(newDom, dom)
      return
    }
  }

  if (typeof vnode.type === 'function') {
    const componentVNode = vnode.type({ ...vnode.props, children: vnode.children })
    return updateElement(dom, componentVNode)
  }

  if (dom.nodeType !== Node.ELEMENT_NODE || dom.tagName.toLowerCase() !== vnode.type) {
    const newDom = _render(vnode)
    dom.parentNode.replaceChild(newDom, dom)
    return
  }

  const oldProps = dom.__vnodeProps || {}
  const newProps = vnode.props || {}

  // Remove old props that are not in new props
  Object.keys(oldProps).forEach(name => {
    if (name === 'children' || name === 'ref') return
    
    // Обработка boolean атрибутов при удалении
    if (name === 'disabled' || name === 'checked' || name === 'selected' || name === 'readonly') {
      if (!(name in newProps)) {
        dom.removeAttribute(name)
      }
      return
    }
    
    if (!(name in newProps)) {
      if (name.startsWith('on')) {
        const event = name.slice(2).toLowerCase()
        if (dom.__handlers && dom.__handlers[event]) {
          dom.removeEventListener(event, dom.__handlers[event])
          delete dom.__handlers[event]
        }
      } else if (name === 'style') {
        dom.style = ''
      } else {
        dom.removeAttribute(name)
      }
    }
  })

  // Set new props
  Object.keys(newProps).forEach(name => {
    if (name === 'children' || name === 'ref') return
    const newVal = newProps[name]
    const oldVal = oldProps[name]
    
    // Обработка boolean атрибутов
    if (name === 'disabled' || name === 'checked' || name === 'selected' || name === 'readonly') {
      if (newVal && !oldVal) {
        dom.setAttribute(name, '')
      } else if (!newVal && oldVal) {
        dom.removeAttribute(name)
      }
      return
    }
    
    if (name.startsWith('on') && typeof newVal === 'function') {
      const event = name.slice(2).toLowerCase()
      if (dom.__handlers && dom.__handlers[event] && dom.__handlers[event] === newVal) return
      if (dom.__handlers && dom.__handlers[event]) dom.removeEventListener(event, dom.__handlers[event])
      dom.addEventListener(event, newVal)
      dom.__handlers = dom.__handlers || {}
      dom.__handlers[event] = newVal
    } else if (name === 'style' && typeof newVal === 'object') {
      dom.style = ''
      Object.assign(dom.style, newVal)
    } else {
      if (oldVal !== newVal) dom.setAttribute(name, newVal)
    }
  })

  dom.__vnodeProps = newProps

  const ref = newProps && newProps.ref
  if (ref) {
    if (typeof ref === 'function') ref(dom)
    else if (typeof ref === 'object') {
      try { ref.current = dom } catch (e) {}
    }
  }

  // Update children
  const newChildren = vnode.children || []
  const childNodes = Array.from(dom.childNodes)
  const max = Math.max(childNodes.length, newChildren.length)
  for (let i = 0; i < max; i++) {
    const childVNode = newChildren[i]
    const childDom = childNodes[i]
    if (childVNode && childDom) {
      updateElement(childDom, childVNode)
    } else if (childVNode && !childDom) {
      dom.appendChild(_render(childVNode))
    } else if (!childVNode && childDom) {
      dom.removeChild(childDom)
    }
  }
}

const _default = {
  createElement,
  render,
  useState,
  useRef,
  useEffect,
  createRoot,
}

export default _default
