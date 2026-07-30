import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatINR, formatDate } from "@/lib/format";

const Customers = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/admin/customers").then((r) => setItems(r.data)); }, []);
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-neutral-500">Community</div>
      <h1 className="font-display uppercase text-3xl mt-1 mb-6">Customers ({items.length})</h1>
      <div className="bg-neutral-900 border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-neutral-500 text-left">
            <tr><th className="p-4">Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Spent</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-neutral-800">
                <td className="p-3">{c.name}</td>
                <td className="text-neutral-400">{c.email}</td>
                <td className="text-neutral-400">{c.phone}</td>
                <td>{c.order_count}</td>
                <td className="font-tabular">{formatINR(c.total_spent || 0)}</td>
                <td className="text-neutral-500 text-xs">{formatDate(c.created_at)}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Customers;
