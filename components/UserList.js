import Button from './Button';

export default function UserList({ users, currentUser, onSelectUser, onDeleteUser }) {
  return (
    <div className="space-y-3">
      {users.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum usuário criado ainda</p>
      ) : (
        users.map((user) => (
          <div
            key={user.name}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
              currentUser === user.name
                ? 'bg-purple-50 border-purple-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <button
              onClick={() => onSelectUser(user.name)}
              className="flex-1 text-left"
            >
              <p className={`font-semibold ${currentUser === user.name ? 'text-purple-700' : 'text-gray-800'}`}>
                {user.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentUser === user.name ? '✓ Ativo' : 'Clique para ativar'}
              </p>
            </button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDeleteUser(user.name)}
              className="ml-2"
            >
              🗑️
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
