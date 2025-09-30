/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
  content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
  theme: {
    extend: {
			colors: {
        // Tons de fundo (background)
        'background-primary': '#111827', // Um cinza-azulado bem escuro
        'background-secondary': '#1F2937', // Um card, um pouco mais claro
        'background-tertiary': '#374151', // Para bordas ou elementos hover

        // Cores de texto
        'text-primary': '#F9FAFB',     // Branco, para texto principal
        'text-secondary': '#9CA3AF',   // Cinza-claro, para subtextos
        'text-tertiary': '#6B7280',    // Cinza-médio, para texto desabilitado

        // Cor de acento (principal da marca)
        'accent-primary': '#3B82F6',   // Azul vibrante
        'accent-secondary': '#60A5FA', // Um azul mais claro para hover/foco
        
        // Cores de Status
        'status-success': '#10B981',   // Verde
        'status-warning': '#F59E0B',   // Amarelo/Laranja
        'status-danger': '#EF4444',    // Vermelho
      },
		},
  },
  plugins: [],
}

