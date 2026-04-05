import Button from './Button';

const activityIcons = {
  'Padel': '🎾',
  'Musculação': '💪',
  'Corrida': '🏃',
};

export default function ActivityList({ activities, onRemove }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">📭 Sem atividades no período selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{activityIcons[activity.activity] || '⚡'}</span>
                <div>
                  <p className="font-semibold text-gray-900">{activity.activity}</p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-600">
                  <span className="font-medium">{activity.minutes}</span> min
                </span>
                <span className="text-purple-600 font-semibold">
                  {activity.calories} kcal
                </span>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onRemove(activity.id)}
            >
              ✕
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
