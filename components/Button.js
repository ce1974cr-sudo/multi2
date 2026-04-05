export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
