import { useState, useRef } from "react";
import { useTheme } from "./ThemeContext.jsx";
import SourcePanel from "./components/SourcePanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import ChartsPanel from "./components/ChartsPanel.jsx";
import CommandCenterPage from "./components/CommandCenterPage.jsx";
import PeoplePage from "./components/PeoplePage.jsx";
import datamochaLogo from "./assets/datamocha-logo.svg";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("workspace");
  const [showPalette, setShowPalette] = useState(false);
  const [rightWidth, setRightWidth] = useState(360);
  const [lastChatQuery, setLastChatQuery] = useState("");
  const { mode, toggleMode, colorTemplate, setColorTemplate, COLOR_TEMPLATES } = useTheme();

  const startResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = rightWidth;
    const onMove = (ev) => {
      const diff = startX - ev.clientX;
      setRightWidth(Math.min(Math.max(startW + diff, 260), 600));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div className={`app-layout ${mode}`}>
      <header className={`app-header${activePage === "workspace" ? " header-ws" : ""}`}>
        <div className="header-brand">
          <img src={datamochaLogo} alt="Datamocha" width="28" height="28" />
          <span>Datamocha — Amrutanjan Health Care</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-tab${activePage === "workspace" ? " nav-tab-active" : ""}`}
            onClick={() => setActivePage("workspace")}
          >
            Workspace
          </button>
          <button
            className={`nav-tab${activePage === "command-center" ? " nav-tab-active" : ""}`}
            onClick={() => setActivePage("command-center")}
          >
            Command Center
          </button>
          <button
            className={`nav-tab${activePage === "people" ? " nav-tab-active" : ""}`}
            onClick={() => setActivePage("people")}
          >
            HRMS
          </button>
        </nav>
        <div className="header-actions">
          {/* Color palette toggle */}
          <div className="palette-wrapper">
            <button className="btn-palette" onClick={() => setShowPalette(!showPalette)} title="Color Templates">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.53-.21-1.01-.54-1.37-.33-.35-.46-.83-.46-1.13 0-1.1.9-2 2-2h2.36c3.08 0 5.64-2.56 5.64-5.64C23 5.82 18.05 2 12 2z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="7.5" cy="11.5" r="1.5" fill="currentColor"/>
                <circle cx="10.5" cy="7.5" r="1.5" fill="currentColor"/>
                <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor"/>
                <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor"/>
              </svg>
            </button>
            {showPalette && (
              <div className="palette-dropdown">
                {COLOR_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    className={`palette-item ${colorTemplate === idx ? "active" : ""}`}
                    onClick={() => { setColorTemplate(idx); setShowPalette(false); }}
                  >
                    <div className="palette-dots">
                      {tpl.colors.slice(0, 4).map((c, ci) => (
                        <span key={ci} className="palette-dot" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="palette-name">{tpl.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Dark/Light toggle */}
          <button className="btn-theme-toggle" onClick={toggleMode} title={mode === "dark" ? "Switch to Light" : "Switch to Dark"}>
            {mode === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button className="btn-ghost">Share</button>
          <button className="btn-primary">New Project</button>
        </div>
      </header>
      {activePage === "workspace" && (
        <main className="panels" style={{ gridTemplateColumns: `300px 1fr 6px ${rightWidth}px` }}>
          <SourcePanel />
          <ChatPanel onQueryChange={setLastChatQuery} />
          <div className="panel-resize-handle" onMouseDown={startResize}>
            <div className="panel-resize-grip" />
          </div>
          <ChartsPanel lastQuery={lastChatQuery} />
        </main>
      )}
      {activePage === "command-center" && <CommandCenterPage />}
      {activePage === "people" && <PeoplePage />}
    </div>
  );
}
