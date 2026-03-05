import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// IMPORTANT: adjust this import to whatever your app uses.
// In Shopify Remix template apps, it's usually "~/shopify.server".
import { authenticate } from "~/shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  // Fetch open orders (unfulfilled + not cancelled). You can tweak the query.
  const resp = await admin.rest.resources.Order.all({
    session: admin.session,
    status: "open",
    limit: 50,
  });

  // Depending on library version, this may be resp.data / resp.body / resp
  const orders = resp?.data ?? resp?.body?.orders ?? resp?.orders ?? resp;

  return json({ orders });
}

export default function OrdersPage() {
  const { orders } = useLoaderData();

  return (
    <div style={{ padding: 16 }}>
      <h1>Open Orders</h1>

      <ul>
        {(orders ?? []).map((order) => (
          <li key={order.id}>
            <strong>{order.name ?? `#${order.order_number ?? order.id}`}</strong>

            <ul>
              {(order.line_items ?? []).map((li) => (
                <li key={li.id}>
                  {li.title ?? li.name ?? "(line item)"}
                  {typeof li.quantity === "number" ? ` (qty: ${li.quantity})` : ""}

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
    </div>
  );
}