
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'red-accent': 'hsl(var(--red-accent))',
				'blue-accent': 'hsl(var(--blue-accent))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'signature': ['Great Vibes', 'cursive'],
				'serif': ['Playfair Display', 'serif']
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'apple-bounce': {
					'0%': { 
						transform: 'scale(1)',
						opacity: '1'
					},
					'50%': { 
						transform: 'scale(0.95)',
						opacity: '0.8'
					},
					'100%': { 
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'apple-press': {
					'0%': { 
						transform: 'scale(1) translateY(0)',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
					},
					'100%': { 
						transform: 'scale(0.96) translateY(1px)',
						boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
					}
				},
				'apple-glow': {
					'0%': { 
						boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 20px 10px rgba(59, 130, 246, 0.1)',
						transform: 'scale(1.02)'
					},
					'100%': { 
						boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.0)',
						transform: 'scale(1)'
					}
				},
				'apple-spring': {
					'0%': { 
						transform: 'scale(0.9) rotate(-1deg)',
						opacity: '0'
					},
					'60%': { 
						transform: 'scale(1.03) rotate(0.5deg)',
						opacity: '1'
					},
					'100%': { 
						transform: 'scale(1) rotate(0deg)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'apple-bounce': 'apple-bounce 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'apple-press': 'apple-press 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'apple-glow': 'apple-glow 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'apple-spring': 'apple-spring 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
			},
			transitionTimingFunction: {
				'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
				'apple-spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'apple-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
