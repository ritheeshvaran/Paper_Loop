import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { formatINR, formatDate, statusLabel, statusColor } from "@/lib/format";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const load = () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    api.get(`/admin/orders?${p.toString()}`).then((r) => setOrders(r.data));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-neutral-500">Orders</div>
          <h1 className="font-display uppercase text-3xl mt-1">Manage Orders</h1>
        </div>
        <div className="flex gap-2">
          <input
            data-testid="admin-orders-search"
            value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search order, email, txn…" className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm w-64 focus:outline-none focus:border-neutral-600" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:border-neutral-600">
            <option value="">All statuses</option>
            {["placed", "payment_under_validation", "approved", "preparing", "packed", "out_for_delivery", "delivered", "cancelled"].map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-neutral-500 text-left">
            <tr>
              <th className="p-4">Order</th><th>Customer</th><th>Items</th>
              <th>Total</th><th>Status</th><th>Txn</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} data-testid={`order-row-${o.order_number}`} className="border-t border-neutral-800 hover:bg-neutral-800/50">
                <td className="p-4"><Link to={`/admin/orders/${o.id}`} data-testid={`admin-order-${o.order_number}`} className="font-mono text-xs text-[color:var(--pl-orange)]">{o.order_number}</Link></td>
                <td>
                  <div>{o.customer_name}</div>
                  <div className="text-xs text-neutral-500">{o.customer_email}</div>
                </td>
                <td className="text-neutral-400">{o.items.length}</td>
                <td className="font-tabular">{formatINR(o.total)}</td>
                <td><span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${statusColor(o.status)}`}>{statusLabel(o.status)}</span></td>
                <td className="text-xs font-mono text-neutral-400">{o.transaction_id || "—"}</td>
                <td className="text-neutral-400 text-xs">{formatDate(o.created_at)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-neutral-500">No orders match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Orders;
