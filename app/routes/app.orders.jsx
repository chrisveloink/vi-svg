import React, { useEffect, useState } from "react";

export default function AppOrders() {
  const [info, setInfo] = useState({
    hasWindow: false,
    type: "unknown",
    value: null,
    error: null,
  });

  useEffect(() => {
    try {
      // Only runs in the browser
      const ro = window.read_orders; // <-- IMPORTANT: reference via window
      setInfo({
        hasWindow: true,
        type: typeof ro,
        value: ro ?? null,
        error: null,
      });
    } catch (e) {
      setInfo({
        hasWindow: true,
        type: "error",
        value: null,
        error: String(e?.message ?? e),
      });
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>read_orders debug</h1>

      <div>Client loaded: {String(info.hasWindow)}</div>
      <div>typeof window.read_orders: {info.type}</div>

      {info.error ? (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
          Error: {info.error}
        </pre>
      ) : (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
          {safeStringify(info.value)}
        </pre>
      )}
    </div>
  );
}

// Handles circular structures without crashing
function safeStringify(value) {
  try {
    const seen = new WeakSet();
    return JSON.stringify(
      value,
      (k, v) => {
        if (typeof v === "object" && v !== null) {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        if (typeof v === "bigint") return v.toString();
        return v;
      },
      2
    );
  } catch (e) {
    return `<<could not stringify: ${String(e?.message ?? e)}>>`;
  }
}