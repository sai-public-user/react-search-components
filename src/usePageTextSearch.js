
import { useEffect, useRef, useState } from "react";

export const usePageTextSearch = (query) => {
  const [matches, setMatches] = useState([]);
  const idRef = useRef(0);
  const timeoutRefs = useRef(new Map());

  const clearHighlights = () => {
    document.querySelectorAll(".search-highlight").forEach((el) => {
      el.classList.remove("search-highlight");
    });
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current.clear();
  };

  const findMatches = () => {
    clearHighlights();

    if (!query) {
      setMatches([]);
      return;
    }

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent || parent.closest("[data-ignore-search]")) return NodeFilter.FILTER_SKIP;
          if (node.nodeValue?.toLowerCase().includes(query.toLowerCase())) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        },
      }
    );

    const seen = new Set();
    const newMatches = [];
    let node;

    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (seen.has(parent)) continue;
      seen.add(parent);

      const text = node.nodeValue;
      const index = text.toLowerCase().indexOf(query.toLowerCase());
      const snippet = text.substring(Math.max(0, index - 10), index + query.length + 10);

      newMatches.push({
        text,
        snippet,
        element: parent,
        id: idRef.current++,
      });

      parent.classList.add("search-highlight");

      const timeout = setTimeout(() => {
        parent.classList.remove("search-highlight");
        timeoutRefs.current.delete(parent);
      }, 15000);
      timeoutRefs.current.set(parent, timeout);
    }

    setMatches(newMatches);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .search-highlight {
        outline: 2px dashed orange;
        transition: outline 0.3s ease;
      }
      .search-temp-highlight {
        background-color: yellow;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    findMatches();
  }, [query]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      findMatches();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      clearHighlights();
    };
  }, [query]);

  const scrollToMatch = (match) => {
    match.element.scrollIntoView({ behavior: "smooth", block: "center" });
    match.element.classList.add("search-temp-highlight");
    setTimeout(() => {
      match.element.classList.remove("search-temp-highlight");
    }, 1500);
  };

  return { matches, scrollToMatch };
};
