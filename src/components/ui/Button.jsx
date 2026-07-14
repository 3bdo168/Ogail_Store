import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all-300 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl text-center px-6 py-3 text-base';

  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg focus:ring-primary',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-800 focus:ring-stone-400',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    ghost: 'text-stone-600 hover:bg-stone-100 focus:ring-stone-300'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : 'active:scale-95'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          جاري التحميل...
        </span>
      ) : children}
    </button>
  );
};

export default Button;
