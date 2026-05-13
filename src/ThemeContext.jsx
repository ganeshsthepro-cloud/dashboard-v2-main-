import { createContext, useContext, useState } from "react";

const COLOR_TEMPLATES = [
  { name: "Brand", colors: ["#F5C200", "#2E7B34", "#C62828", "#1565C0", "#F57F00", "#6A1B9A"] },
  { name: "Ocean", colors: ["#0077B6", "#00B4D8", "#90E0EF", "#023E8A", "#48CAE4", "#ADE8F4"] },
  { name: "Sunset", colors: ["#FF6B35", "#F7C59F", "#EFEFD0", "#004E89", "#1A659E", "#FF9F1C"] },
  { name: "Forest", colors: ["#2D6A4F", "#40916C", "#74C69D", "#1B4332", "#52B788", "#B7E4C7"] },
  { name: "Berry", colors: ["#7B2CBF", "#9D4EDD", "#C77DFF", "#3C096C", "#E0AAFF", "#5A189A"] },
  { name: "Warm", colors: ["#E63946", "#F4A261", "#E9C46A", "#264653", "#2A9D8F", "#8AB17D"] },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("dark"); // "dark" | "light"
  const [colorTemplate, setColorTemplate] = useState(0);

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  const colors = COLOR_TEMPLATES[colorTemplate].colors;

  return (
    <ThemeContext.Provider
      value={{ mode, toggleMode, colorTemplate, setColorTemplate, colors, COLOR_TEMPLATES }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
