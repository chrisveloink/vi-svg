// app/routes/app.orders.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

// IMPORTANT: however you expose layout() in your app bundle:
// - if layout() is in the same file, ignore this
// - if it's in another module, import it:
import { layout } from "../lib/layout"; // <- adjust path

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const query = `#graphql
    query OpenOrders {
      orders(first: 20, query: "status:open") {
        nodes {
          id
          name
          cancelledAt
          closedAt
          lineItems(first: 50) {
            nodes {
              id
              title
              quantity
              customAttributes {
                key
                value
              }
            }
          }
        }
      }
    }
  `;

  const res = await admin.graphql(query);
  const json = await res.json();
  const orders = json?.data?.orders?.nodes ?? [];
  return { orders };
}

// Convert Shopify customAttributes -> values object your layout() expects
function customAttributesToValues(customAttributes) {
  const values = {};
  for (const a of customAttributes ?? []) {
    if (!a?.key) continue;
    if (a.key.startsWith("_")) continue; // common hidden/internal convention
    if (a.value == null) continue;
    const v = String(a.value).trim();
    if (!v) continue;
    values[a.key] = v;
  }
  return values;
}

function LineItemSvg({ order, lineItem }) {
  const mountRef = useRef(null);

  // Build values once per line item
  const values = useMemo(
    () => customAttributesToValues(lineItem.customAttributes),
    [lineItem.customAttributes]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!mountRef.current) return;

      // layout() needs cfg. In your script it's: window.veloinkProductConfig
      if (!window.veloinkProductConfig) {
        mountRef.current.textContent = "Missing window.veloinkProductConfig";
        return;
      }

      try {
        await layout({
          productTitle: lineItem.title,
          values,
          print: true,                 // ✅ print mode
          id: lineItem.id,             // used for gradientId + background id
          item_count: "",              // you can fill if you have it
          order_number: order.name,    // order.name is like "#1234"
          size: values.Size || "",
          finish: values.Finish || "",
          container: mountRef.current, // ✅ mount inside this React node
          clearContainer: true,
        });
      } catch (e) {
        if (!cancelled && mountRef.current) {
          mountRef.current.textContent = `Render error: ${e?.message || e}`;
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [order.name, lineItem.id, lineItem.title, values]);

  return (
    <div
      ref={mountRef}
      style={{
        border: "1px solid #ddd",
        padding: 8,
        marginTop: 8,
        overflowX: "auto",
      }}
    />
  );
}

export default function OrdersPage() {
  const { orders } = useLoaderData();

  return (
    <div style={{ padding: 16 }}>
      <h1>Open Orders</h1>

      <ul>
        {orders.map((o) => (
          <li key={o.id} style={{ marginBottom: 16 }}>
            <strong>{o.name}</strong>

            <ul>
              {o.lineItems.nodes.map((li) => (
                <li key={li.id} style={{ marginTop: 12 }}>
                  <div>
                    {li.title} (qty: {li.quantity})
                  </div>

                  {/* ✅ Replace UL of properties with SVG output */}
                  {li.customAttributes?.length ? (
                    <LineItemSvg order={o} lineItem={li} />
                  ) : (
                    <div style={{ opacity: 0.7, marginTop: 8 }}>
                      (no properties)
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}