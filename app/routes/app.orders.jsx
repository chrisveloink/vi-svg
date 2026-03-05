// app.orders.jsx
import React from "react";

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function isTruthyDate(v) {
  return v !== null && v !== undefined && String(v).trim() !== "";
}

function getOrderNumber(order) {
  return (
    order?.order_number ??
    order?.orderNumber ??
    order?.name ?? // GraphQL often "#1001"
    order?.id ??
    "(unknown order)"
  );
}

// A more Shopify-REST-friendly "open" heuristic:
// - not cancelled
// - not closed
// (optionally you can also require not fully fulfilled; see comment below)
function isOpenOrder(order) {
  const cancelledAt = order?.cancelled_at ?? order?.canceledAt ?? order?.cancelledAt;
  const closedAt = order?.closed_at ?? order?.closedAt;

  if (isTruthyDate(cancelledAt)) return false;
  if (isTruthyDate(closedAt)) return false;

  // Optional: treat fully fulfilled as not open (uncomment if you want)
  // const fulfillmentStatus = (order?.fulfillment_status ?? order?.displayFulfillmentStatus ?? "")
  //   .toString()
  //   .toLowerCase();
  // if (fulfillmentStatus === "fulfilled") return false;

  return true;
}

export default function OrdersPage() {
  const orders = typeof read_orders !== "undefined" ? read_orders : [];
  const safeOrders = asArray(orders);

  const openOrders = safeOrders.filter(isOpenOrder);

  // Debug: helps you see what the objects actually contain
  const debugSample = safeOrders.slice(0, 5).map((o) => ({
    order_number: o?.order_number,
    name: o?.name,
    status: o?.status,
    closed_at: o?.closed_at,
    closedAt: o?.closedAt,
    cancelled_at: o?.cancelled_at,
    canceledAt: o?.canceledAt,
    fulfillment_status: o?.fulfillment_status,
    displayFulfillmentStatus: o?.displayFulfillmentStatus,
    financial_status: o?.financial_status,
  }));

  return (
    <div style={{ padding: 16 }}>
      <h1>Open Orders</h1>

      <div style={{ marginBottom: 12 }}>
        <div><strong>Total orders:</strong> {safeOrders.length}</div>
        <div><strong>Open orders (heuristic):</strong> {openOrders.length}</div>
      </div>

      {/* Remove this block after you confirm the right fields */}
      <details style={{ marginBottom: 16 }}>
        <summary>Debug: sample order fields</summary>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(debugSample, null, 2)}
        </pre>
      </details>

      {openOrders.length === 0 ? (
        <>
          <p>No open orders found by the current filter.</p>
          <p style={{ marginTop: 8 }}>
            To verify data is loading, here are <strong>all orders</strong> rendered below:
          </p>
          <OrdersTree orders={safeOrders} />
        </>
      ) : (
        <OrdersTree orders={openOrders} />
      )}
    </div>
  );
}

function OrdersTree({ orders }) {
  return (
    <ul>
      {orders.map((order) => {
        const orderNumber = getOrderNumber(order);

        const rawLineItems =
          order?.line_items ??
          order?.lineItems?.edges?.map((e) => e?.node) ??
          order?.lineItems ??
          [];

        const lineItems = asArray(rawLineItems);

        return (
          <li key={order?.id ?? String(orderNumber)}>
            <strong>Order {orderNumber}</strong>

            <ul>
              {lineItems.length ? (
                lineItems.map((li, idx) => {
                  const title = li?.title ?? li?.name ?? "(untitled item)";
                  const qty = li?.quantity ?? li?.currentQuantity ?? li?.qty;

                  const propsArray = Array.isArray(li?.properties)
                    ? li.properties
                    : li?.customAttributes?.edges?.map((e) => e?.node) ??
                      li?.customAttributes ??
                      [];

                  const props = asArray(propsArray).filter(Boolean);

                  return (
                    <li key={li?.id ?? `${orderNumber}-${idx}`}>
                      {title}
                      {typeof qty !== "undefined" ? ` (qty: ${qty})` : ""}

                      <ul>
                        {props.length ? (
                          props.map((p, pIdx) => {
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
  );
}