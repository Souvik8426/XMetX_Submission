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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        unbounded: ['Unbounded', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1F376A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#3D6B9C",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "#5C92C7",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#333333",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#333333",
        },
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      },
      animation: {
        marquee: 'marquee 40s linear infinite'
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;