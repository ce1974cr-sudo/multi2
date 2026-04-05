export default function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onKeyDown,
  disabled = false,
  error = false,
  helperText = '',
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {helperText && (
        <p className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
