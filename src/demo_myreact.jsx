import React, { useState, useRef, useEffect } from 'minireact'
import { createElement } from 'minireact';
import ReactDOM from 'minireact-dom';


export default function DemoMyReact({ a, flag }) {
    console.log('a =', a);
    console.log('flag =', flag);

    const [c, setC] = useState(0);
    const btnRef = useRef();

    useEffect(() => {
        if (btnRef.current) {
            console.log('count изменился:', c);
            btnRef.current.style.background = '#ffd';
            setTimeout(() => {
                btnRef.current.style.background = '';
            }, 200);
        }
    }, [c]);

    return (
        <div
            class='asddsa'
            style={{
                position: 'fixed',
                right: 12,
                bottom: 12,
                background: 'white',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
        >
            {/* Проверка пропсов */}
            <p style={{ margin: '0 0 8px 0', color: 'blue' }}>
                {a && a.aboba ? `Пропсы работают: ${a.aboba}` : 'Пропсы НЕ переданы'}
            </p>

            {/* Проверка булевого пропса */}
            <p style={{ margin: '0 0 8px 0', color: flag ? 'green' : 'red' }}>
                Булевый проп flag: {flag ? 'TRUE' : 'FALSE'}
            </p>

            <p style={{ margin: '0 0 8px 0' }}>my-react demo — Count: {c}</p>

            <div style={{ display: 'flex', gap: 8 }}>
                <button ref={btnRef} onClick={() => setC(c + 1)}>Inc</button>

                {/* Используем проп прямо в кнопке */}
                <button onClick={() => setC(0)}>
                    Reset {a && a.aboba ? a.aboba : '—'}
                </button>
            </div>
        </div>
    );
}


// ТЕСТ ПРОПСОВ
const abc = {
    aboba: 'lalala',
    popa: 12
};

// Передаём булевый проп flag
// Этот файл экспортирует компонент DemoMyReact. Ниже — демонстрация монтирования.
// Правильный способ — передавать компонент или vnode в render,
// не вызывать компонент вручную (это запускает хуки вне цикла рендера).
// Если нужно передать параметр, передайте его как пропсу:

// ReactDOM.render(createElement(DemoMyReact, { a: abc }), document.getElementById('root'))

