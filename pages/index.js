// pages/index.js
import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Card from '../components/Card';
import Stats from '../components/Stats';
import UserList from '../components/UserList';
import ActivityList from '../components/ActivityList';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, TimeScale);

export default function Home() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [activities, setActivities] = useState([]);
  const [activity, setActivity] = useState('');
  const [minutes, setMinutes] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [newUserName, setNewUserName] = useState('');

  // Carregar lista de usuários e usuário corrente
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(savedUsers);
    const savedCurrentUser = localStorage.getItem('currentUser') || '';
    setCurrentUser(savedCurrentUser);
  }, []);

  // Carregar atividades do usuário selecionado
  useEffect(() => {
    if (!currentUser) {
      setActivities([]);
      return;
    }
    const data = JSON.parse(localStorage.getItem(currentUser) || '[]');
    setActivities(Array.isArray(data) ? data : []);
    const profile = JSON.parse(localStorage.getItem(`${currentUser}_profile`) || '{}');
    if (profile.weight) setWeight(profile.weight);
    if (profile.height) setHeight(profile.height);
  }, [currentUser]);

  // Salvar perfil do usuário
  useEffect(() => {
    if (!currentUser) return;
    const profile = { weight, height };
    localStorage.setItem(`${currentUser}_profile`, JSON.stringify(profile));
  }, [currentUser, weight, height]);

  // Calcular calorias
  const calculateCalories = (activityType, minutesVal, weightKg) => {
    const w = parseFloat(weightKg) || 70;
    const m = parseFloat(minutesVal) || 0;
    const METS = { Padel: 7, 'Musculação': 6, Corrida: 10 };
    const met = METS[activityType] || 6;
    return Math.round(met * w * (m / 60));
  };

  // Criar usuário
  const addUser = (name) => {
    const nm = (name || '').trim();
    if (!nm) {
      alert('Digite um nome válido');
      return;
    }
    if (users.some(u => u.name === nm)) {
      setCurrentUser(nm);
      localStorage.setItem('currentUser', nm);
      setNewUserName('');
      return;
    }
    const newUsers = [...users, { name: nm }];
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
    localStorage.setItem(nm, JSON.stringify([]));
    localStorage.setItem('currentUser', nm);
    setCurrentUser(nm);
    setNewUserName('');
  };

  // Excluir usuário
  const deleteUser = (name) => {
    if (!confirm(`Deseja excluir o usuário "${name}" e todos os dados locais?`)) return;
    const updated = users.filter(u => u.name !== name);
    setUsers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
    localStorage.removeItem(name);
    localStorage.removeItem(`${name}_profile`);
    if (currentUser === name) {
      setCurrentUser('');
      localStorage.removeItem('currentUser');
    }
  };

  // Adicionar atividade
  const handleAddActivity = () => {
    if (!currentUser) {
      alert('Selecione um usuário');
      return;
    }
    if (!activity || !minutes || !date) {
      alert('Preencha atividade, minutos e data.');
      return;
    }
    const calories = calculateCalories(activity, minutes, weight);
    const newAct = { id: Date.now(), date, activity, minutes: +minutes, calories };
    const updated = [...activities, newAct];
    setActivities(updated);
    localStorage.setItem(currentUser, JSON.stringify(updated));
    setActivity('');
    setMinutes('');
  };

  // Remover atividade
  const removeActivity = (id) => {
    if (!confirm('Confirma exclusão dessa atividade?')) return;
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    if (currentUser) localStorage.setItem(currentUser, JSON.stringify(updated));
  };

  // Filtrar atividades por período
  const filteredActivities = useMemo(() => {
    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;
    return activities
      .filter(a => {
        const d = new Date(a.date);
        if (s && d < s) return false;
        if (e && d > e) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activities, startDate, endDate]);

  // Dados para gráfico diário
  const dailyChartData = useMemo(() => {
    const grouped = {};
    filteredActivities.forEach(a => {
      grouped[a.date] = (grouped[a.date] || 0) + a.calories;
    });
    const labels = Object.keys(grouped).sort();
    return {
      labels,
      datasets: [{
        label: 'Gasto diário (kcal)',
        data: labels.map(l => grouped[l]),
        backgroundColor: '#a855f7',
        borderRadius: 6,
        borderSkipped: false,
      }]
    };
  }, [filteredActivities]);

  // Dados para gráfico mensal
  const monthlyChartData = useMemo(() => {
    const grouped = {};
    filteredActivities.forEach(a => {
      const dt = new Date(a.date);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + a.calories;
    });
    const sortedKeys = Object.keys(grouped).sort();
    const labels = sortedKeys.map(k => {
      const [y, m] = k.split('-');
      const d = new Date(y, parseInt(m, 10) - 1, 1);
      return d.toLocaleString('default', { month: 'short', year: 'numeric' });
    });
    return {
      labels,
      datasets: [{
        label: 'Gasto mensal (kcal)',
        data: sortedKeys.map(k => grouped[k]),
        backgroundColor: '#a855f7',
        borderRadius: 6,
        borderSkipped: false,
      }]
    };
  }, [filteredActivities]);

  // Calcular totais
  const totalCalories = filteredActivities.reduce((sum, a) => sum + a.calories, 0);
  const totalMinutes = filteredActivities.reduce((sum, a) => sum + a.minutes, 0);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="container py-8">
        {/* Seção de Usuários */}
        <section className="mb-12">
          <h2 className="section-title">👥 Gerenciar Usuários</h2>
          
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Nome do novo usuário"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addUser(newUserName);
                  }
                }}
              />
              <Button
                variant="primary"
                onClick={() => addUser(newUserName)}
                className="sm:w-auto"
              >
                ➕ Criar Usuário
              </Button>
            </div>
          </Card>

          <UserList
            users={users}
            currentUser={currentUser}
            onSelectUser={(name) => {
              setCurrentUser(name);
              localStorage.setItem('currentUser', name);
            }}
            onDeleteUser={deleteUser}
          />
        </section>

        {/* Seção do Usuário Ativo */}
        {currentUser ? (
          <>
            <section className="mb-12">
              <h2 className="section-title">📊 Registrar Atividade</h2>
              
              <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <Input
                    label="Peso (kg)"
                    type="number"
                    placeholder="Ex: 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <Input
                    label="Altura (cm)"
                    type="number"
                    placeholder="Ex: 180"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                  <Input
                    label="Data"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <Select
                    label="Atividade"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    options={[
                      { value: 'Padel', label: '🎾 Padel' },
                      { value: 'Musculação', label: '💪 Musculação' },
                      { value: 'Corrida', label: '🏃 Corrida' },
                    ]}
                  />
                  <Input
                    label="Minutos"
                    type="number"
                    placeholder="Ex: 60"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="success"
                    onClick={handleAddActivity}
                    className="flex-1"
                  >
                    ✓ Registrar Atividade
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm('Limpar todo o histórico visível?')) {
                        setActivities([]);
                        localStorage.setItem(currentUser, JSON.stringify([]));
                      }
                    }}
                    className="flex-1"
                  >
                    🗑️ Limpar Histórico
                  </Button>
                </div>
              </Card>
            </section>

            {/* Filtro de Período */}
            <section className="mb-12">
              <h3 className="subsection-title">🔍 Filtrar por Período</h3>
              
              <Card>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Data Inicial"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="Data Final"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <div className="flex items-end">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="w-full"
                    >
                      ✕ Limpar Filtro
                    </Button>
                  </div>
                </div>
              </Card>
            </section>

            {/* Estatísticas */}
            {filteredActivities.length > 0 && (
              <section className="mb-12">
                <h3 className="subsection-title">📈 Resumo</h3>
                <div className="grid-responsive">
                  <Stats
                    value={totalCalories}
                    label="Total de Calorias"
                    icon="🔥"
                    color="purple"
                  />
                  <Stats
                    value={totalMinutes}
                    label="Total de Minutos"
                    icon="⏱️"
                    color="blue"
                  />
                  <Stats
                    value={filteredActivities.length}
                    label="Atividades"
                    icon="💪"
                    color="green"
                  />
                </div>
              </section>
            )}

            {/* Gráficos */}
            <section className="mb-12">
              <h3 className="subsection-title">📊 Gasto Diário</h3>
              <Card>
                <div className="h-80">
                  <Bar data={dailyChartData} options={chartOptions} />
                </div>
              </Card>
            </section>

            <section className="mb-12">
              <h3 className="subsection-title">📅 Gasto Mensal</h3>
              <Card>
                <div className="h-80">
                  <Bar data={monthlyChartData} options={chartOptions} />
                </div>
              </Card>
            </section>

            {/* Histórico de Atividades */}
            <section className="mb-12">
              <h3 className="subsection-title">📋 Histórico de Atividades</h3>
              <ActivityList
                activities={filteredActivities}
                onRemove={removeActivity}
              />
            </section>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-500 mb-4">👤 Nenhum usuário selecionado</p>
            <p className="text-gray-400">Crie ou selecione um usuário para começar</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
        <div className="container text-center">
          <p className="text-sm">
            Cal © 2026 — Controle de Calorias | Desenvolvido com ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
