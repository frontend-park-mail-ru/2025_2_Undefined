import React, { useEffect, useState, render } from 'react';


const TextFields = () => {
	const [value, set] = useState(0);
    useEffect (() => {
    }, [value])
    
	return (
		<div>
            <input value={value} onChange={e => set(e.target.value)} />
            { value == 6 && <span>колобок</span>}
            <button onClick={() => set(+value + 1)}> + </button>
        </div>
        
	);
};


render(<TextFields />, document.body);