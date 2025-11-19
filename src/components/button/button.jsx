import React from 'minireact';

export function Button({ 
  children,
  variant = 'primary',
  size = 'md', // Изменен default на 'md'
  icon,
  iconPosition = 'left',
  iconSize, // Кастомный размер иконки (xs, sm, md, lg, xl)
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props 
}) {
  const baseClass = 'button'
  const variantClass = `button--${variant}`
  const sizeClass = `button--${size}`
  
  // Определяем, является ли кнопка только с иконкой
  const isIconOnly = !children && icon
  const iconOnlyClass = isIconOnly ? 'button--icon-only' : ''
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    iconOnlyClass,
    className
  ].filter(Boolean).join(' ')

  // Маппинг размеров кнопки на размеры иконки
  const getIconSizeClass = () => {
    if (iconSize) {
      return `icon--size-${iconSize}`
    }
    
    // Автоматическое соответствие размеров кнопки и иконки
    const sizeMap = {
      'xs': 'xs',
      'sm': 'sm',
      'md': 'md', 
      'lg': 'lg',
      'xl': 'xl'
    }
    
    return `icon--size-${sizeMap[size] || 'md'}`
  }

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e)
    }
  }

  const renderIcon = () => {
    if (!icon) return null
    
    const iconSizeClass = getIconSizeClass()
    
    return (
      <i class={`icon ${icon}-icon ${iconSizeClass}`}></i>
    )
  }

  const renderContent = () => {
    if (loading) {
      const iconSizeClass = getIconSizeClass()
      return (
        <>
          <i class={`icon loading-icon ${iconSizeClass}`}></i>
          <span>Loading...</span>
        </>
      )
    }

    const iconElement = renderIcon()
    
    if (!iconElement) {
      return children
    }

    if (!children) {
      return iconElement
    }

    return (
      <>
        {iconPosition === 'left' && iconElement}
        <span>{children}</span>
        {iconPosition === 'right' && iconElement}
      </>
    )
  }

  return (
    <button
      class={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {renderContent()}
    </button>
  )
}

export default Button