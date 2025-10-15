import type React from "react";
import { FiCamera } from "react-icons/fi";

interface VideoFeedProps {
	streamUrl?: string;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ streamUrl }) => {
	const src = streamUrl;

	// Altura baseada na viewport, subtrai espaço aproximado de header/footer/padding.
	// Ajuste o valor (220px) conforme altura real do header/footer da aplicação.
	const imageContainerStyle: React.CSSProperties = {
		minHeight: 'calc(100vh - 220px)'
	};

	return (
		<div className="flex flex-col bg-white/70 dark:bg-background-secondary/70 backdrop-blur-sm border border-gray-200 dark:border-background-tertiary rounded-xl shadow-lg p-4 overflow-hidden">
			<div className="flex items-center mb-4">
				<FiCamera className="text-accent-primary mr-3" size={20} />
				<h2 className="text-lg text-gray-900 dark:text-text-primary font-bold">Monitoramento ao Vivo</h2>
			</div>

			<div style={imageContainerStyle} className="flex items-center justify-center bg-gray-100 dark:bg-background-primary rounded-md overflow-hidden">
				{src ? (
					<img
						src={src}
						alt={`Stream de vídeo`}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="text-gray-600 dark:text-text-secondary p-6">
						<p className="font-medium">Nenhuma câmera selecionada</p>
						<p className="text-sm">Escolha uma câmera no seletor para visualizar o feed.</p>
					</div>
				)}
			</div>
		</div>
	);
};
