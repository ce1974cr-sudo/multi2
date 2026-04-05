export default function Card({ 
  children, 
  title, 
  subtitle,
  className = '',
  ...props 
}) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-6 transition-shadow duration-200 hover:shadow-lg ${className}`}
      {...props}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
