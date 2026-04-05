export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Selecione uma opção',
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
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
