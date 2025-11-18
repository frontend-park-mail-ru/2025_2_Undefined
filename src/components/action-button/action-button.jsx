import React from 'minireact';

export function ActionButton({ icon, onClick, ref }) {
  return <button class="button action-button" ref={ref} onClick={onClick}>
    <i class={`icon ${icon}-icon`}></i>
  </button>
}

