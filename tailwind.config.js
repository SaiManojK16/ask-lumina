/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#FFFFFF", // Light background
          dark: "#1B1B1B",  // Dark background (slightly darker for depth)
        },
        secondary: {
          light: "#F7F7F7", // Subtle light secondary (for cards, sidebar)
          dark: "#252525",  // Subtle dark secondary
        },
        tertiary: {
          light: "#E5E5E5", // For input fields or muted components
          dark: "#3B3B3B",  // Dark tertiary
        },
        accent: {
          light: "#02a4c7", // Gradient start
          dark: "#89ba86",  // Gradient end
        },
        regular: {
          light: "#2B2B2B", // Darker text for contrast in light mode
          dark: "#FFFFFF",  // White text in dark mode
        },
        muted: {
          light: "#6B7280", // Muted gray for subtitles or placeholders
          dark: "#9CA3AF",  // Slightly muted text in dark mode
        },
      },
      gradientColorStops: {
        'lumina-start': "#02a4c7", // Lumina gradient start
        'lumina-end': "#89ba86",  // Lumina gradient end
      },
    },
  },
  plugins: [],
};
