// app/routes/app.orders.jsx
import React from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server"; // <-- adjust if needed

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const resp = await admin.rest.resources.Order.all({
    session: admin.session,
    status: "open",
    limit: 50,
  });

  const orders = resp?.data ?? resp?.body?.orders ?? resp?.orders ?? [];
  return { orders };
}

export default function OrdersPage() {
  const { orders } = useLoaderData();
  return (
    <div style={{ padding: 20 }}>
      <h1>Open orders debug</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(orders, null, 2)}
      </pre>
    </div>
  );
}