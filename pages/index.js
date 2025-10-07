
import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, TimeScale);

export default function Home() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioAtivo, setUsuarioAtivo] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [tipo, setTipo] = useState('Corrida');
  const [tempo, setTempo] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0]);
  const [atividades, setAtividades] = useState([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem('usuarios') || '{}');
    setUsuarios(Object.keys(dados));
  }, []);

  // Carrega dados do usuário ativo
  useEffect(() => {
    if (usuarioAtivo) {
      const dados = JSON.parse(localStorage.getItem('usuarios') || '{}');
      if (dados[usuarioAtivo]) {
        setPeso(dados[usuarioAtivo].peso);
        setAltura(dados[usuarioAtivo].altura);
        setAtividades(dados[usuarioAtivo].atividades || []);
      }
    }
  }, [usuarioAtivo]);

  // Cálculo do gasto calórico (simples)
  const calcularGasto = (tipo, tempo, peso) => {
    const MET = {
      'Corrida': 9.8,
      'Musculação': 6.0,
      'Padel': 7.0
    }[tipo] || 5;
    return (MET * peso * (tempo / 60)).toFixed(0);
  };

  const salvarAtividade = () => {
    if (!usuarioAtivo || !tempo || !peso || !altura) return alert('Preencha todos os campos');
    const gasto = calcularGasto(tipo, tempo, peso);
    const novaAtividade = { data, tipo, tempo, gasto: Number(gasto) };

    const dados = JSON.parse(localStorage.getItem('usuarios') || '{}');
    const userData = dados[usuarioAtivo] || { peso, altura, atividades: [] };
    userData.peso = peso;
    userData.altura = altura;
    userData.atividades.push(novaAtividade);
    dados[usuarioAtivo] = userData;
    localStorage.setItem('usuarios', JSON.stringify(dados));

    setAtividades(userData.atividades);
    setTempo('');
  };

  const excluirAtividade = (index) => {
    const dados = JSON.parse(localStorage.getItem('usuarios') || '{}');
    const userData = dados[usuarioAtivo];
    if (userData) {
      userData.atividades.splice(index, 1);
      dados[usuarioAtivo] = userData;
      localStorage.setItem('usuarios', JSON.stringify(dados));
      setAtividades([...userData.atividades]);
    }
  };

  const criarUsuario = () => {
    const nome = prompt('Digite o nome do novo usuário:');
    if (nome && !usuarios.includes(nome)) {
      const dados = JSON.parse(localStorage.getItem('usuarios') || '{}');
      dados[nome] = { peso: '', altura: '', atividades: [] };
      localStorage.setItem('usuarios', JSON.stringify(dados));
      setUsuarios(Object.keys(dados));
      setUsuarioAtivo(nome);
    }
  };

  // Preparar dados para gráfico
  const dadosGrafico = useMemo(() => {
    const porData = {};
    atividades.forEach(a => {
      porData[a.data] = (porData[a.data] || 0) + a.gasto;
    });
    const labels = Object.keys(porData).sort();
    return {
      labels,
      datasets: [
        {
          label: 'Gasto Calórico (kcal)',
          data: labels.map(l => porData[l]),
          backgroundColor: 'rgba(124, 58, 237, 0.5)', // Roxo intermediário translúcido
          borderColor: 'rgba(124, 58, 237, 1)',       // Roxo sólido
          borderWidth: 2,
        }
      ]
    };
  }, [atividades]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Controle de Atividades</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Usuário</label>
        <select
          className="border p-2 rounded w-full"
          value={usuarioAtivo}
          onChange={(e) => setUsuarioAtivo(e.target.value)}
        >
          <option value="">Selecione um usuário</option>
          {usuarios.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <button onClick={criarUsuario} className="bg-purple-600 text-white px-3 py-1 rounded mt-2">
          + Novo Usuário
        </button>
      </div>

      {usuarioAtivo && (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="border p-2 rounded col-span-2"
            />
            <input
              type="number"
              placeholder="Peso (kg)"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Altura (m)"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="border p-2 rounded col-span-2"
            >
              <option>Corrida</option>
              <option>Musculação</option>
              <option>Padel</option>
            </select>
            <input
              type="number"
              placeholder="Tempo (min)"
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
              className="border p-2 rounded col-span-2"
            />
          </div>

          <button onClick={salvarAtividade} className="bg-purple-600 text-white px-4 py-2 rounded w-full mb-6">
            Salvar Atividade
          </button>

          <h2 className="text-lg font-semibold mb-2">Histórico</h2>
          <ul className="mb-4">
            {atividades.map((a, i) => (
              <li key={i} className="flex justify-between border-b py-2">
                <span>{a.data} — {a.tipo} ({a.tempo} min): {a.gasto} kcal</span>
                <button
                  onClick={() => excluirAtividade(i)}
                  className="text-red-600 text-sm"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>

          {atividades.length > 0 && (
            <div className="bg-white p-4 rounded shadow">
              <Bar data={dadosGrafico} />
              <div className="mt-6">
                <Line data={dadosGrafico} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}