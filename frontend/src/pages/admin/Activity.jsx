import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

const Activity = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/admin/activity").then((r) => setItems(r.data)); }, []);
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-neutral-500">Audit trail</div>
      <h1 className="font-display uppercase text-3xl mt-1 mb-6">Activity Log</h1>
      <div className="bg-neutral-900 border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-neutral-500 text-left">
            <tr><th className="p-4">When</th><th>Admin</th><th>Action</th><th>Entity</th><th>Before</th><th>After</th></tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-neutral-800">
                <td className="p-3 text-neutral-400 text-xs whitespace-nowrap">{formatDate(a.created_at)}</td>
                <td className="text-xs">{a.admin_email}</td>
                <td className="text-[color:var(--pl-orange)] uppercase tracking-widest text-[10px]">{a.action_type}</td>
                <td className="text-xs">{a.entity_type} · <span className="font-mono">{(a.entity_id || "").slice(0, 8)}</span></td>
                <td className="text-xs text-neutral-500 max-w-xs truncate">{JSON.stringify(a.before_value)}</td>
                <td className="text-xs text-neutral-300 max-w-xs truncate">{JSON.stringify(a.after_value)}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No activity yet — admin changes will show up here.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Activity;
