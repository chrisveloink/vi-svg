import React from "react";

export default function AppOrders() {
  return (
    <div style={{ padding: 20 }}>
      <h1>read_orders debug</h1>

      <div>typeof read_orders: {typeof read_orders}</div>

      <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
        {JSON.stringify(read_orders, null, 2)}
      </pre>
    </div>
  );
}