import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell 
} from 'recharts';
import { FiActivity, FiBox, FiCamera, FiCheckCircle, FiGrid, FiTrendingUp, FiLoader } from 'react-icons/fi';

const SERVER_IP = import.meta.env.VITE_SERVER_IP || '192.168.1.82';
const API_PORT = 8036; 

const AVAILABLE_MACHINES = [
  { id: 'Maquina_1', port: 8036, name: 'Trefila 01' },
  { id: 'Maquina_2', port: 8037, name: 'Trefila 02' },
];

const KPICard = ({ titulo, valor, icone, cor }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-transform hover:scale-105">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{titulo}</p>
      <h4 className="text-3xl font-black text-gray-900 dark:text-white">{valor}</h4>
    </div>
    <div className={`p-4 rounded-xl ${cor} bg-opacity-20 backdrop-blur-sm`}>
      {icone}
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<'bi' | 'monitoramento'>('bi');
  const [maquinaFoco, setMaquinaFoco] = useState(AVAILABLE_MACHINES[0]);
  const [dadosBI, setDadosBI] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGestaoData = async () => {
      try {
        const response = await fetch(`http://${SERVER_IP}:${API_PORT}/api/v1/gestao/dashboard`);
        if (response.ok) {
          const data = await response.json();
          setDadosBI(data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do BI:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGestaoData();
    const intervalId = setInterval(fetchGestaoData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-8 font-sans">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-blue-600 p-3 rounded-lg mr-4 shadow-lg shadow-blue-500/30">
            <FiActivity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">IANorth <span className="font-light text-blue-500">Corporate</span></h1>
            <p className="text-sm text-gray-500 font-medium">Controle de Fardos e Produção</p>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          <button onClick={() => setAbaAtiva('bi')} className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${abaAtiva === 'bi' ? 'bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
            <FiTrendingUp className="mr-2" /> Visão Global (Fardos)
          </button>
          <button onClick={() => setAbaAtiva('monitoramento')} className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${abaAtiva === 'monitoramento' ? 'bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
            <FiCamera className="mr-2" /> Monitoramento
          </button>
        </div>
      </header>

      {abaAtiva === 'bi' && !isLoading && dadosBI && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KPICard titulo="Fardos Produzidos (Hoje)" valor={dadosBI.kpis.fardos_hoje} cor="text-blue-600 bg-blue-100" icone={<FiBox className="w-8 h-8" />} />
            <KPICard titulo="Peças Totais Processadas" valor={dadosBI.kpis.pecas_hoje.toLocaleString()} cor="text-green-600 bg-green-100" icone={<FiCheckCircle className="w-8 h-8" />} />
            <KPICard titulo="Trefilas em Operação" valor={dadosBI.kpis.maquinas_ativas} cor="text-purple-600 bg-purple-100" icone={<FiGrid className="w-8 h-8" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-6">Produção de Fardos (Hora a Hora)</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosBI.producao_hora}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="hora" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Maquina_1" name="Fardos Trefila 01" stroke="#4F46E5" strokeWidth={4} />
                    <Line type="monotone" dataKey="Maquina_2" name="Fardos Trefila 02" stroke="#10B981" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-6">Fardos por Trefila (Total Hoje)</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosBI.totais_por_maquina}>
                    <XAxis dataKey="nome" stroke="#6B7280" fontSize={12} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="total" name="Fardos" radius={[8, 8, 0, 0]}>
                      {dadosBI.totais_por_maquina.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'monitoramento' && (
        <div className="space-y-6 animate-fadeIn">
           <div className="flex items-center space-x-4 mb-6">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Selecione a Trefila:</span>
            <select 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold shadow-sm"
              value={maquinaFoco.id}
              onChange={(e) => setMaquinaFoco(AVAILABLE_MACHINES.find(m => m.id === e.target.value) || AVAILABLE_MACHINES[0])}
            >
              {AVAILABLE_MACHINES.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-4 flex items-center"><FiCamera className="mr-2 text-blue-500"/> Câmera Edge ao Vivo</h3>
              <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border-4 border-gray-900">
                <img 
                  src={`http://${SERVER_IP}:${maquinaFoco.port}/api/v1/video_feed/local`} 
                  alt="Feed da Máquina"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
