import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
  	extend: {
      backgroundImage: {
        'blue-gradient': 'linear-gradient(to bottom, #54CCFF 75%, #222046)',
        'hero-pattern': "url('/bg-image.png')",
      },
      backgroundClip: {
        'text': 'text',
      },
  		colors: {
        deepBlue: '#171B3B',
        featureBlue: '#54CCFF',
        featureDark: '#222046',
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
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
		  },
		fontFamily: {
        	sans: ['var(--font-satoshi)', 'arial', 'sans-serif'],
        	heading: ['var(--font-bricolage)', 'serif'],
      	},
  		keyframes: {
  			'accordion-down': {
  				from: { 'height': '0' },
  				to: { 'height': 'var(--radix-accordion-content-height)' },
  			},
  			'accordion-up': {
  				from: { 'height': 'var(--radix-accordion-content-height)' },
  				to: { 'height': '0' },
  			},
  			fadeIn: {
  				'0%': { opacity: '0', transform: 'translateY(10px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			fadeOut: {
  				'0%': { opacity: '1', transform: 'translateY(0)' },
  				'100%': { opacity: '0', transform: 'translateY(-10px)' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			fadeIn: 'fadeIn 0.5s ease-out forwards',
  			fadeOut: 'fadeOut 0.5s ease-out forwards',
  		},
  	}
  },
  plugins: [animatePlugin],
} satisfies Config;
