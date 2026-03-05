// app.orders.jsx
import React from "react";

function normalizeOrder(maybeWrapped) {
  // Your example is { order: { ... } }, but support both shapes.
  return maybeWrapped?.order ?? maybeWrapped ?? null;
}

function isOpenOrder(order) {
  // Shopify REST: open if not cancelled and not closed
  return order?.cancelled_at == null && order?.closed_at == null;
}

export default function AppOrders() {
  const raw = typeof read_orders !== "undefined" ? read_orders : [];
  const rows = Array.isArray(raw) ? raw : [];

  const orders = rows.map(normalizeOrder).filter(Boolean);
  const openOrders = orders.filter(isOpenOrder);

  return (
    <div style={{ padding: 16 }}>
      <h1>Open Orders</h1>

      <div style={{ marginBottom: 12 }}>
        <div>
          <strong>Total loaded:</strong> {orders.length}
        </div>
        <div>
          <strong>Open:</strong> {openOrders.length}
        </div>
      </div>

      {openOrders.length === 0 ? (
        <p>No open orders found.</p>
      ) : (
        <ul>
          {openOrders.map((order) => (
            <li key={order.id}>
              <strong>{order.name ?? `#${order.order_number ?? order.id}`}</strong>

              <ul>
                {(order.line_items ?? []).map((li) => (
                  <li key={li.id}>
                    {li.title ?? li.name ?? "(line item)"}{" "}
                    {typeof li.quantity === "number" ? `(qty: ${li.quantity})` : ""}

                    <ul>
                      {(li.properties ?? []).length ? (
                        li.properties.map((p, idx) => (
                          <li key={`${li.id}-prop-${idx}`}>
                            {p?.name ?? "(name)"}: {String(p?.value ?? "")}
                          </li>
                        ))
                      ) : (
                        <li>(no properties)</li>
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}