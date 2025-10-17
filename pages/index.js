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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, TimeScale);

export default function Home() {
  const [users, setUsers] = useState([]);               // [{name}]
  const [currentUser, setCurrentUser] = useState('');   // string name
  const [activities, setActivities] = useState([]);     // [{id, date, activity, minutes, calories}]
  const [activity, setActivity] = useState('');
  const [minutes, setMinutes] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // carregar lista de usuários e usuário corrente
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(savedUsers);
    const savedCurrentUser = localStorage.getItem('currentUser') || '';
    setCurrentUser(savedCurrentUser);
  }, []);

  // carregar atividades do usuário selecionado
  useEffect(() => {
    if (!currentUser) {
      setActivities([]);
      return;
    }
    const data = JSON.parse(localStorage.getItem(currentUser) || '[]');
    setActivities(Array.isArray(data) ? data : []);
    // carregar peso/altura salvos (se desejar manter persistência separada)
    const profile = JSON.parse(localStorage.getItem(`${currentUser}_profile`) || '{}');
    if (profile.weight) setWeight(profile.weight);
    if (profile.height) setHeight(profile.height);
  }, [currentUser]);

  // salvar perfil do usuário (peso/altura)
  useEffect(() => {
    if (!currentUser) return;
    const profile = { weight, height };
    localStorage.setItem(`${currentUser}_profile`, JSON.stringify(profile));
  }, [currentUser, weight, height]);

  // função utilitária: calcular calorias (fórmula simples)
  const calculateCalories = (activityType, minutesVal, weightKg) => {
    const w = parseFloat(weightKg) || 70;
    const m = parseFloat(minutesVal) || 0;
    const METS = { Padel: 7, 'Musculação': 6, Corrida: 10 };
    const met = METS[activityType] || 6;
    // fórmula aproximada: kcal = (MET * peso (kg) * tempo(h))
    return Math.round(met * w * (m / 60));
  };

  // criar usuário (simples)
  const addUser = (name) => {
    const nm = (name || '').trim();
    if (!nm) return alert('Digite um nome válido');
    if (users.some(u => u.name === nm)) {
      setCurrentUser(nm);
      localStorage.setItem('currentUser', nm);
      return;
    }
    const newUsers = [...users, { name: nm }];
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
    // inicializa storage do usuário
    localStorage.setItem(nm, JSON.stringify([]));
    localStorage.setItem('currentUser', nm);
    setCurrentUser(nm);
  };

  // excluir usuário (remove dados e da lista)
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

  // adicionar atividade (salva em localStorage por usuário)
  const handleAddActivity = () => {
    if (!currentUser) return alert('Selecione um usuário');
    if (!activity || !minutes || !date) return alert('Preencha atividade, minutos e data.');
    const calories = calculateCalories(activity, minutes, weight);
    const newAct = { id: Date.now(), date, activity, minutes: +minutes, calories };
    const updated = [...activities, newAct];
    setActivities(updated);
    localStorage.setItem(currentUser, JSON.stringify(updated));
    // limpar campos
    setActivity('');
    setMinutes('');
  };

  // **função de excluir atividade (requisito pedido)** — remove por id
  const removeActivity = (id) => {
    if (!confirm('Confirma exclusão dessa atividade?')) return;
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    if (currentUser) localStorage.setItem(currentUser, JSON.stringify(updated));
  };

  // filtrar por período e ordenar decrescente (mais recente primeiro)
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

  // dados para gráfico diário (aplica filtro)
  const dailyChartData = useMemo(() => {
    const grouped = {};
    filteredActivities.forEach(a => {
      grouped[a.date] = (grouped[a.date] || 0) + a.calories;
    });
    const labels = Object.keys(grouped).sort(); // labels em ordem crescente de data
    return {
      labels,
      datasets: [{
        label: 'Gasto diário (kcal)',
        data: labels.map(l => grouped[l]),
        backgroundColor: '#7C3AED'
      }]
    };
  }, [filteredActivities]);

  // dados para gráfico mensal (barras acumuladas por mês)
  const monthlyChartData = useMemo(() => {
    const grouped = {};
    filteredActivities.forEach(a => {
      const dt = new Date(a.date);
      // chave "YYYY-MM" para ordenar corretamente
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + a.calories;
    });
    const sortedKeys = Object.keys(grouped).sort(); // yyyy-mm ordenado
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
        backgroundColor: '#7C3AED'
      }]
    };
  }, [filteredActivities]);

  // helpers UI simples
  const handleCreateUserFromInput = (e) => {
    if (e.key === 'Enter') {
      addUser(e.target.value);
      e.target.value = '';
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#7C3AED' }}>Cal — Controle de Calorias</h1>

      {/* USUÁRIOS */}
      <section style={{ marginTop: 20 }}>
        <h3>Usuários</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Novo usuário (pressione Enter)" onKeyDown={handleCreateUserFromInput} />
          <button onClick={() => {
            const name = prompt('Nome do usuário:');
            if (name) addUser(name);
          }}>Criar</button>
        </div>
        <ul>
          {users.map(u => (
            <li key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <button onClick={() => {
                setCurrentUser(u.name);
                localStorage.setItem('currentUser', u.name);
              }}>
                {currentUser === u.name ? <b>{u.name}</b> : u.name}
              </button>
              <button onClick={() => deleteUser(u.name)} style={{ marginLeft: 8, color: 'red' }}>🗑️ Excluir usuário</button>
            </li>
          ))}
        </ul>
      </section>

      {/* ÁREA DO USUÁRIO ATIVO */}
      {currentUser ? (
        <>
          <h2 style={{ color: '#6B21A8', marginTop: 16 }}>Usuário ativo: {currentUser}</h2>

          {/* CAMPOS DE LANÇAMENTO */}
          <section style={{ marginTop: 12, display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <input type="number" placeholder="Peso (kg)" value={weight} onChange={e => setWeight(e.target.value)} />
            <input type="number" placeholder="Altura (cm)" value={height} onChange={e => setHeight(e.target.value)} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <select value={activity} onChange={e => setActivity(e.target.value)}>
              <option value="">Selecione atividade</option>
              <option value="Padel">Padel</option>
              <option value="Musculação">Musculação</option>
              <option value="Corrida">Corrida</option>
            </select>
            <input type="number" placeholder="Minutos" value={minutes} onChange={e => setMinutes(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAddActivity} style={{ background: '#10B981', color: '#fff', padding: '6px 10px' }}>Registrar</button>
              <button onClick={() => {
                if (confirm('Limpar todo o histórico visível?')) {
                  setActivities([]);
                  localStorage.setItem(currentUser, JSON.stringify([]));
                }
              }} style={{ background: '#EF4444', color: '#fff', padding: '6px 10px' }}>Limpar histórico</button>
            </div>
          </section>

          {/* FILTRO DE PERÍODOS */}
          <section style={{ marginTop: 18 }}>
            <h4>Filtro de período</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <div>
                <label>Início</label><br />
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label>Fim</label><br />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => { setStartDate(''); setEndDate(''); }}>Limpar filtro</button>
              </div>
            </div>
          </section>

          {/* GRÁFICOS - POSICIONADOS ACIMA DO HISTÓRICO */}
          <section style={{ marginTop: 24 }}>
            <h3>Gasto diário (barras)</h3>
            <div style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
              <Bar data={dailyChartData} />
            </div>

            <h3 style={{ marginTop: 20 }}>Gasto mensal (barras acumuladas)</h3>
            <div style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
              <Bar data={monthlyChartData} />
            </div>
          </section>

          {/* HISTÓRICO - ORDEM DECRESCENTE (mais recente no topo) */}
          <section style={{ marginTop: 24 }}>
            <h3>Histórico de atividades</h3>
            {filteredActivities.length === 0 ? (
              <div>Sem atividades no período selecionado.</div>
            ) : (
              <ul>
                {filteredActivities.map(a => (
                  <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <div><strong>{a.date}</strong> — {a.activity}</div>
                      <div style={{ fontSize: 13, color: '#555' }}>{a.minutes} min — {a.calories} kcal</div>
                    </div>
                    <div>
                      <button onClick={() => removeActivity(a.id)} style={{ color: 'red' }}>Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <div style={{ marginTop: 20, color: '#666' }}>Selecione ou crie um usuário para começar</div>
      )}
    </div>
  );
}
