import React, { useState, useEffect } from 'react';
import { getHistoricoLotes, type LoteHistorico } from '../../services/loteService';
import { FiArchive, FiLoader } from 'react-icons/fi';

const HistoricoLotes: React.FC = () => {
  const [lotes, setLotes] = useState<LoteHistorico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistorico = async () => {
      setIsLoading(true);
      const historico = await getHistoricoLotes();
      setLotes(historico);
      setIsLoading(false);
    };

    fetchHistorico();
  }, []);

  const formatarData = (dataString: string | null) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <FiLoader className="animate-spin mr-2" />
        Carregando histórico...
      </div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-background-secondary/70 backdrop-blur-sm border border-gray-200 dark:border-background-tertiary rounded-xl shadow-lg p-6 mt-8">
      <div className="flex items-center mb-4">
        <FiArchive className="text-accent-primary mr-3" size={20} />
        <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">
          Histórico de Lotes Concluídos
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-background-tertiary uppercase text-xs text-gray-700 dark:text-text-secondary">
            <tr>
              <th scope="col" className="px-4 py-3">Lote ID</th>
              <th scope="col" className="px-4 py-3">Câmera</th>
              <th scope="col" className="px-4 py-3">Contagem Final</th>
              <th scope="col" className="px-4 py-3">Início</th>
              <th scope="col" className="px-4 py-3">Fim</th>
              <th scope="col" className="px-4 py-3">Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {lotes.length > 0 ? (
              lotes.map((lote) => (
                <tr key={lote.id} className="border-b dark:border-background-tertiary hover:bg-gray-50 dark:hover:bg-background-tertiary">
                  <td className="px-4 py-3 font-medium">#{lote.id}</td>
                  <td className="px-4 py-3">{lote.camera_id}</td>
                  <td className="px-4 py-3 font-bold text-accent-secondary">{lote.final_count}</td>
                  <td className="px-4 py-3">{formatarData(lote.start_time)}</td>
                  <td className="px-4 py-3">{formatarData(lote.end_time)}</td>
                  <td className="px-4 py-3">
                    
                    {lote.image_base64 ? (
                      <img 
                        src={`data:image/jpeg;base64,${lote.image_base64}`} 
                        alt={`Snapshot Lote ${lote.id}`} 
                        className="w-24 h-auto rounded hover:opacity-80 transition-opacity cursor-pointer"
                        onClick={() => {
                          const newTab = window.open();
                          if (newTab) {
                            newTab.document.body.innerHTML = `<body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;height:100vh;"><img src="data:image/jpeg;base64,${lote.image_base64}" style="max-width:100%;max-height:100vh;"></body>`;
                          }
                        }}
                      />
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum lote concluído encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricoLotes;