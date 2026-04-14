import React, { useState, useRef } from 'react';
import { 
  FiX, FiSave, FiCheckCircle, FiAlertCircle, 
  FiMonitor, FiVideo, FiLock, FiUser, FiCpu, FiTarget, FiUploadCloud 
} from 'react-icons/fi';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ isOpen, onClose }) => {
  const [cameraType, setCameraType] = useState<'ip' | 'usb'>('ip');
  const [ip, setIp] = useState('10.6.58.207');
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('eletricasnb2021');
  const [usbIndex, setUsbIndex] = useState('0');

  const [modelPath, setModelPath] = useState('/app/models/ver37.pt');
  const [targetCount, setTargetCount] = useState(200);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Função para lidar com o upload do arquivo .pt
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pt')) {
      alert("Por favor, selecione apenas arquivos de modelo (.pt)");
      return;
    }

    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/upload-modelo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        // Preenche o campo texto automaticamente com o caminho do novo modelo!
        setModelPath(data.caminho); 
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setUploadStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const finalCameraSource = cameraType === 'ip' 
      ? `rtsp://${user}:${pass}@${ip}:554/cam/realmonitor?channel=1&subtype=0`
      : usbIndex;

    try {
      const response = await fetch('/api/v1/configurar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera_source: finalCameraSource,
          model_path: modelPath,
          target_count: Number(targetCount),
        }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          onClose();
          window.location.reload(); 
        }, 1500);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Erro ao configurar máquina:", error);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white dark:bg-background-secondary w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-background-tertiary max-h-[90vh] overflow-y-auto">
        
        {/* Cabeçalho */}
        <div className="bg-gray-50 dark:bg-background-primary px-6 py-4 border-b border-gray-200 dark:border-background-tertiary flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <FiMonitor className="text-accent-primary w-6 h-6" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary">Configurações do Sistema</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* a ESQUERDA CÂMERA */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-text-secondary flex items-center border-b border-gray-100 dark:border-background-tertiary pb-2">
                <FiVideo className="mr-2" /> Fonte de Vídeo
              </h3>

              <div className="flex p-1 bg-gray-100 dark:bg-background-tertiary rounded-lg">
                <button type="button" onClick={() => setCameraType('ip')} className={`flex-1 py-1.5 text-sm font-medium rounded-md ${cameraType === 'ip' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Câmera IP</button>
                <button type="button" onClick={() => setCameraType('usb')} className={`flex-1 py-1.5 text-sm font-medium rounded-md ${cameraType === 'usb' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Webcam</button>
              </div>

              {cameraType === 'ip' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">ENDEREÇO IP</label>
                    <input type="text" required value={ip} onChange={(e) => setIp(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-background-primary border border-gray-300 dark:border-background-tertiary rounded-lg outline-none focus:ring-2 focus:ring-accent-primary" placeholder="10.6.58.207" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center"><FiUser className="mr-1"/> USUÁRIO</label>
                      <input type="text" required value={user} onChange={(e) => setUser(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-background-primary border border-gray-300 dark:border-background-tertiary rounded-lg outline-none focus:ring-2 focus:ring-accent-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center"><FiLock className="mr-1"/> SENHA</label>
                      <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-background-primary border border-gray-300 dark:border-background-tertiary rounded-lg outline-none focus:ring-2 focus:ring-accent-primary" />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">ÍNDICE DA CÂMERA USB</label>
                  <input type="text" required value={usbIndex} onChange={(e) => setUsbIndex(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-background-primary border border-gray-300 dark:border-background-tertiary rounded-lg outline-none focus:ring-2 focus:ring-accent-primary" placeholder="0" />
                </div>
              )}
            </div>

            {/* a DIREITA IA E UPLOAD */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-text-secondary flex items-center border-b border-gray-100 dark:border-background-tertiary pb-2">
                <FiCpu className="mr-2" /> Inteligência Artificial
              </h3>

              {/* UPLOAD */}
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${uploadStatus === 'uploading' ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : uploadStatus === 'success' ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-background-tertiary hover:border-accent-primary hover:bg-gray-50 dark:hover:bg-background-tertiary'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".pt" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <FiUploadCloud className={`mx-auto h-8 w-8 mb-2 ${uploadStatus === 'success' ? 'text-green-500' : 'text-gray-400'}`} />
                {uploadStatus === 'uploading' ? (
                  <p className="text-sm font-medium text-blue-600">Enviando modelo...</p>
                ) : uploadStatus === 'success' ? (
                  <p className="text-sm font-medium text-green-600">Modelo recebido!</p>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-text-primary">Fazer upload de novo Modelo</p>
                    <p className="text-xs text-gray-500 mt-1">Clique para buscar um arquivo .pt</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CAMINHO DO MODELO ATUAL</label>
                <input type="text" required value={modelPath} onChange={(e) => setModelPath(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-background-primary border border-gray-300 dark:border-background-tertiary rounded-lg outline-none focus:ring-2 focus:ring-accent-primary text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center"><FiTarget className="mr-1"/> PEÇAS POR LOTE (TARGET)</label>
                <input type="number" required min="1" value={targetCount} onChange={(e) => setTargetCount(Number(e.target.value))} className="w-full px-3 py-2 text-lg font-bold bg-gray-50 dark:bg-background-primary border border-gray-300 dark:border-background-tertiary rounded-lg outline-none focus:ring-2 focus:ring-accent-primary" />
              </div>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-background-tertiary flex justify-between items-center">
             <div className="text-sm">
                {status === 'loading' && <span className="text-blue-500 animate-pulse flex items-center"><FiCpu className="mr-2 animate-spin"/> Aplicando...</span>}
                {status === 'success' && <span className="text-status-success flex items-center"><FiCheckCircle className="mr-2"/> Sucesso!</span>}
                {status === 'error' && <span className="text-status-error flex items-center"><FiAlertCircle className="mr-2"/> Erro ao salvar</span>}
              </div>
            <button type="submit" disabled={status === 'loading' || status === 'success'} className="px-6 py-2 bg-accent-primary hover:bg-indigo-600 text-white font-medium rounded-lg flex items-center">
              <FiSave className="mr-2" /> Salvar e Reiniciar IA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
