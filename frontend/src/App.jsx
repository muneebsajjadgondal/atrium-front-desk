import { useEffect, useState } from "react";
import DirectoryPanel from "./components/DirectoryPanel.jsx";
import ChatTerminal from "./components/ChatTerminal.jsx";

export default function App() {
  const [businesses, setBusinesses] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetch("/api/businesses")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load the business directory.");
        return res.json();
      })
      .then((data) => {
        setBusinesses(data);
        if (data.length) setActiveId(data[0].id);
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  const activeBusiness = businesses.find((b) => b.id === activeId) || null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="topbar-logo">A</span>
        <span className="topbar-title">Atrium</span>
        <span className="topbar-sub">AI Front Desk</span>
        <div className="topbar-right">
          <span className="env-pill">
            <span className="dot" />
            Live
          </span>
        </div>
      </header>

      {loadError ? (
        <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#4b5163" }}>
          {loadError} — make sure the API is running (see README).
        </div>
      ) : (
        <div className="app-body">
          <DirectoryPanel
            businesses={businesses}
            activeId={activeId}
            onSelect={setActiveId}
          />
          <ChatTerminal business={activeBusiness} />
        </div>
      )}
    </div>
  );
}
