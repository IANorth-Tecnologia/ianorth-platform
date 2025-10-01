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
        // Dark theme colors (your existing ones)
        'background-primary': '#111827', // Um cinza-azulado bem escuro
        'background-secondary': '#1F2937', // Um card, um pouco mais claro
        'background-tertiary': '#374151', // Para bordas ou elementos hover
        'text-primary': '#F9FAFB',     // Branco, para texto principal
        'text-secondary': '#9CA3AF',   // Cinza-claro, para subtextos
        'text-tertiary': '#6B7280',    // Cinza-médio, para texto desabilitado

        // Light theme colors (complementary)
        'light-background-primary': '#FFFFFF',   // Branco puro
        'light-background-secondary': '#F9FAFB', // Cinza muito claro
        'light-background-tertiary': '#F3F4F6',  // Cinza claro para bordas
        'light-text-primary': '#111827',         // Texto escuro principal
        'light-text-secondary': '#6B7280',       // Texto escuro secundário
        'light-text-tertiary': '#9CA3AF',        // Texto escuro terciário

        // Accent colors (trabalham bem em ambos os temas)
        'accent-primary': '#3B82F6',   // Azul vibrante
        'accent-secondary': '#3B82F6', // Mesmo azul do primary para melhor visibilidade
        
        // Status colors (trabalham bem em ambos os temas)
        'status-success': '#10B981',   // Verde
        'status-warning': '#F59E0B',   // Amarelo/Laranja
        'status-danger': '#EF4444',    // Vermelho
      },
		},
  },
  plugins: [],
}

