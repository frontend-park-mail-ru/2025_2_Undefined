# @undefined/my-react

Минимальная реализация React-подобной библиотеки с `createElement`, `render`, `useState`.

Пример использования:

1. Установите локально в проекте:

```bash
cd /home/said/2025_2_Undefined
npm install ./lib/my-react
```

2. В коде:

```javascript
import { createElement, createRoot, useState } from '@undefined/my-react'

function Counter() {
  const [c, setC] = useState(0)
  return createElement('div', null,
    createElement('p', null, 'Count: ', String(c)),
    createElement('button', { onClick: () => setC(c + 1) }, 'Inc')
  )
}

const root = document.getElementById('root')
createRoot(createElement(Counter, null), root)
```

Ограничения: это очень упрощённая реализация, без диффинга, без жизненных циклов, без корректного управления хуками между компонентами.
