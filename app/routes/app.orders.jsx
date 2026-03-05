import React from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server"; // keep whatever path you proved works

export async function loader({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    const resp = await admin.rest.resources.Order.all({
      session: admin.session,
      status: "open",
      limit: 10,
    });

    const orders = resp?.data ?? resp?.body?.orders ?? resp?.orders ?? resp ?? null;

    return {
      ok: true,
      ordersCount: Array.isArray(orders) ? orders.length : null,
      orders,
      debug: {
        respType: typeof resp,
        respKeys: resp && typeof resp === "object" ? Object.keys(resp) : null,
      },
    };
  } catch (e) {
    return {
      ok: false,
      errorMessage: String(e?.message ?? e),
      errorStack: e?.stack ? String(e.stack) : null,
    };
  }
}

export default function OrdersPage() {
  const data = useLoaderData();
  return (
    <div style={{ padding: 20 }}>
      <h1>Orders debug</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}