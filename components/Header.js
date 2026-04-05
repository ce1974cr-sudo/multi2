export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-2">
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Cal</h1>
              <p className="text-purple-100 text-xs sm:text-sm">Controle de Calorias</p>
            </div>
          </div>
          <div className="text-purple-100 text-sm hidden sm:block">
            Rastreie suas atividades e calorias
          </div>
        </div>
      </div>
    </header>
  );
}
