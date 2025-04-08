
import React, { useState } from "react";
import { usePageTextSearch } from "./usePageTextSearch";

export const PageTextSearchBar = () => {
  const [query, setQuery] = useState("");
  const [hoverId, setHoverId] = useState(null);
  const { matches, scrollToMatch } = usePageTextSearch(query);

  return (
    <div
      data-ignore-search
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 10000,
        background: "#fff",
        padding: "1rem",
        borderRadius: "0.5rem",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        width: 300,
        fontFamily: "Arial, sans-serif"
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search text..."
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      />
      {matches.length > 0 && (
        <ul style={{ maxHeight: 200, overflowY: "auto", padding: 0, margin: 0, listStyle: "none" }}>
          {matches.map((match) => (
            <li
              key={match.id}
              onMouseEnter={() => {
                setHoverId(match.id);
                match.element.classList.add("search-temp-highlight");
              }}
              onMouseLeave={() => {
                setHoverId(null);
                match.element.classList.remove("search-temp-highlight");
              }}
              onClick={() => scrollToMatch(match)}
              style={{
                padding: "6px 8px",
                cursor: "pointer",
                backgroundColor: hoverId === match.id ? "#f0f0f0" : "transparent",
                borderBottom: "1px solid #eee"
              }}
              title={match.text}
            >
              ...{match.snippet}...
            </li>
          ))}
        </ul>
      )}
      {query && matches.length === 0 && (
        <div style={{ fontStyle: "italic", fontSize: "0.9rem", color: "#777" }}>
          No matches found
        </div>
      )}
    </div>
  );
};
