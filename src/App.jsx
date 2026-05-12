import { useState } from "react";
import SourcePanel from "./components/SourcePanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import ChartsPanel from "./components/ChartsPanel.jsx";
import CommandCenterPage from "./components/CommandCenterPage.jsx";
import PeoplePage from "./components/PeoplePage.jsx";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("workspace");

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>DataMocha</span>
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
          <button className="btn-ghost">Share</button>
          <button className="btn-primary">New Project</button>
        </div>
      </header>
      {activePage === "workspace" && (
        <main className="panels">
          <SourcePanel />
          <ChatPanel />
          <ChartsPanel />
        </main>
      )}
      {activePage === "command-center" && <CommandCenterPage />}
      {activePage === "people" && <PeoplePage />}
    </div>
  );
}
