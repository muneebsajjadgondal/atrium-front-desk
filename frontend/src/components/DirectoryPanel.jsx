import { BUSINESS_META, initialsFor } from "../data/businessMeta.js";

export default function DirectoryPanel({ businesses, activeId, onSelect }) {
  return (
    <aside className="directory">
      <div className="directory-header">
        <h1>Businesses</h1>
        <span className="directory-count">{businesses.length}</span>
      </div>

      <ul className="directory-list">
        {businesses.map((biz) => {
          const meta = BUSINESS_META[biz.id] || { sector: "" };
          const isActive = biz.id === activeId;
          return (
            <li key={biz.id}>
              <button
                className={`directory-item${isActive ? " active" : ""}`}
                style={{ "--item-accent": biz.accent }}
                onClick={() => onSelect(biz.id)}
                aria-pressed={isActive}
              >
                <span className="directory-avatar">
                  {initialsFor(biz.label)}
                  <span className="status-dot" />
                </span>
                <span className="directory-item-text">
                  <span className="name">{biz.label}</span>
                  <span className="sector">{meta.sector}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
