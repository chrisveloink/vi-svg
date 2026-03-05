// app/routes/app.orders.jsx
import React from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server"; // keep your working path

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

export default function OrdersPage() {
  const { orders } = useLoaderData();

  return (
    <div style={{ padding: 16 }}>
      <h1>Open Orders</h1>

      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            <strong>{o.name}</strong>

            <ul>
              {o.lineItems.nodes.map((li) => (
                <li key={li.id}>
                  {li.title} (qty: {li.quantity})
                  <ul>
                    {li.customAttributes?.length ? (
                      li.customAttributes.map((a, idx) => (
                        <li key={`${li.id}-attr-${idx}`}>
                          {a.key}: {a.value}
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
    </div>
  );
}