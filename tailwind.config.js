import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },

  plugins: [daisyui],

  daisyui: {
    themes: [
      {
        "240dark": {
          primary: "#4DAA32",        // dartboard green
          secondary: "#C62828",      // dartboard red
          accent: "#F5F5F5",

          neutral: "#111827",
          "base-100": "#050A0D",     // page background
          "base-200": "#0A1117",     // cards / panels
          "base-300": "#111C24",     // borders / elevated cards

          info: "#3B82F6",
          success: "#4DAA32",        // official-style board green
          warning: "#F59E0B",
          error: "#C62828",          // official-style board red

          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "0.5rem",

          "--animation-btn": "0.2s",
          "--animation-input": "0.2s",

          "--btn-focus-scale": "0.98",

          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.75rem",
        },
      },

      {
        "240light": {
          primary: "#3F8F29",
          secondary: "#B91C1C",
          accent: "#111827",

          neutral: "#1F2937",
          "base-100": "#F8FAFC",
          "base-200": "#E5E7EB",
          "base-300": "#CBD5E1",

          info: "#2563EB",
          success: "#3F8F29",
          warning: "#D97706",
          error: "#B91C1C",

          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "0.5rem",

          "--animation-btn": "0.2s",
          "--animation-input": "0.2s",

          "--btn-focus-scale": "0.98",

          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.75rem",
        },
      },
    ],

    darkTheme: "240dark",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};