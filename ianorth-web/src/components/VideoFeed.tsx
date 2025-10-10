import type React from "react"
import { FiCamera } from "react-icons/fi"

export const VideoFeed : React.FC = () => {
	return (
		<div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 h-full flex-col">
			<div className="flex items-center mb-4" >
				<FiCamera className="text-accent-primary mr-3" size={20} />
				<h2 className="text-lg text-gray-900 dark:text-white font-bold">Monitoramento ao Vivo </h2>
			</div>
			<div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-black/50 rounded-md overflow-hidden">
				<img
					src="/IA-Verg-1.gif"
					alt="Contagem de Vergalhões"
					className="h-full w-full object-cover"
				/>
			</div>
		</div>
	)
}
