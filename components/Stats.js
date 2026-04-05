export default function Stats({ value, label, icon, color = 'purple' }) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200">
      {icon && (
        <div className={`${colorClasses[color]} rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl`}>
          {icon}
        </div>
      )}
      <p className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-600 text-sm mt-2">{label}</p>
    </div>
  );
}
