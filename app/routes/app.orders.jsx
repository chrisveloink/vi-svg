// app.orders.jsx

import React from "react";

/**
 * Expects `read_orders` to be in scope (array).
 * Renders: Order -> Line Items -> Line Item Properties as nested <ul>.
 */
export default function OrdersPage() {
  // If read_orders is in scope, this will work.
  // If you're in strict module scope and it's not global, you'll need to pass it as props or load it.
  const orders = typeof read_orders !== "undefined" ? read_orders : [];

  // "Open orders" can mean different things depending on your API.
  // We'll consider orders "open" if:
  // - status is "open" OR
  // - closedAt is null/undefined OR
  // - financial/fulfillment status indicates it's not completed
  const openOrders = (Array.isArray(orders) ? orders : []).filter((o) => {
    const status = (o?.status || o?.displayFulfillmentStatus || o?.fulfillment_status || "")
      .toString()
      .toLowerCase();

    const closedAt = o?.closedAt ?? o?.closed_at;
    if (status === "open") return true;
    if (!closedAt) return true;

    // fallback: if we can’t tell, keep it out unless it explicitly looks closed/cancelled
    if (status.includes("cancel")) return false;
    if (status.includes("closed")) return false;

    return false;
  });

  if (!openOrders.length) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Open Orders</h1>
        <p>No open orders found.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Open Orders</h1>

      <ul>
        {openOrders.map((order) => {
          const orderNumber =
            order?.order_number ??
            order?.orderNumber ??
            order?.name ?? // GraphQL often uses "name" like "#1001"
            order?.id ??
            "(unknown order)";

          const rawLineItems =
            order?.line_items ??
            order?.lineItems?.edges?.map((e) => e?.node) ??
            order?.lineItems ??
            [];

          const lineItems = Array.isArray(rawLineItems) ? rawLineItems : [];

          return (
            <li key={order?.id ?? String(orderNumber)}>
              <strong>Order {orderNumber}</strong>

              <ul>
                {lineItems.length ? (
                  lineItems.map((li, idx) => {
                    const title = li?.title ?? li?.name ?? "(untitled item)";
                    const qty = li?.quantity ?? li?.currentQuantity ?? li?.qty;

                    // Shopify REST line_item properties: [{ name, value }]
                    // Sometimes properties might be object-like or absent.
                    const propsArray = Array.isArray(li?.properties)
                      ? li.properties
                      : li?.customAttributes?.edges?.map((e) => e?.node) ??
                        li?.customAttributes ??
                        [];

                    const props = Array.isArray(propsArray) ? propsArray : [];

                    return (
                      <li key={li?.id ?? `${orderNumber}-${idx}`}>
                        {title}
                        {typeof qty !== "undefined" ? ` (qty: ${qty})` : ""}

                        <ul>
                          {props.length ? (
                            props
                              .filter(Boolean)
                              .map((p, pIdx) => {
                                const k = p?.name ?? p?.key ?? "(key)";
                                const v = p?.value ?? "";
                                return (
                                  <li key={`${li?.id ?? idx}-prop-${pIdx}`}>
                                    {k}: {String(v)}
                                  </li>
                                );
                              })
                          ) : (
                            <li>(no properties)</li>
                          )}
                        </ul>
                      </li>
                    );
                  })
                ) : (
                  <li>(no line items)</li>
                )}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}