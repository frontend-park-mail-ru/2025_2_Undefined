import React from 'minireact';

export function ActionButton({ icon, onClick, ref }) {

  const abc = () => console.log('abc');
  const qwe = () => console.log('qwe');

  const handleClick = () => {
    if (action === 'abc') abc();
    if (action === 'qwe') qwe();
  };
  
  return (
    <button class="button action-button" ref={ref} onClick={onClick}>
      <i class={`icon ${icon}-icon`}></i>
    </button>
  );
}
