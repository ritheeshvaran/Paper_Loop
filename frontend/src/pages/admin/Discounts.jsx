import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";

const empty = {
  name: "", type: "percent", value: 10,
  applies_to: "all", target_slug: "",
  starts_at: "", ends_at: "",
  is_featured_sale: false, is_active: true,
};

const Discounts = () => {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [f, setF] = useState(empty);

  const load = () => api.get("/admin/discounts").then((r) => setItems(r.data));
  useEffect(() => {
    load();
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/admin/products").then((r) => setProducts(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/admin/discounts", f); toast.success("Discount created & applied"); setF(empty); load(); api.get("/admin/products").then((r) => setProducts(r.data)); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const del = async (id) => {
    if (!window.confirm("Delete this discount and reset the affected prices?")) return;
    await api.delete(`/admin/discounts/${id}`); toast.success("Deleted"); load(); api.get("/admin/products").then((r) => setProducts(r.data));
  };

  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-neutral-500">Merch strategy</div>
      <h1 className="font-display uppercase text-3xl mt-1 mb-6">Discounts</h1>

      <form onSubmit={submit} className="bg-neutral-900 border border-neutral-800 p-5 mb-6 grid md:grid-cols-2 gap-3">
        <div className="col-span-2 grid grid-cols-2 gap-3">
          <input placeholder="Discount name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm col-span-2" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-neutral-500">Type</label>
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="w-full mt-1 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm">
            <option value="percent">Percent %</option>
            <option value="flat">Flat ₹</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-neutral-500">Value</label>
          <input type="number" min="0" step="0.01" required value={f.value} onChange={(e) => setF({ ...f, value: Number(e.target.value) })} className="w-full mt-1 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-neutral-500">Applies to</label>
          <select value={f.applies_to} onChange={(e) => setF({ ...f, applies_to: e.target.value, target_slug: "" })} className="w-full mt-1 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm">
            <option value="all">Entire catalog</option>
            <option value="category">Category</option>
            <option value="product">Single product</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-neutral-500">Target</label>
          {f.applies_to === "category" && (
            <select value={f.target_slug} onChange={(e) => setF({ ...f, target_slug: e.target.value })} className="w-full mt-1 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm">
              <option value="">Choose category</option>
              {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          )}
          {f.applies_to === "product" && (
            <select value={f.target_slug} onChange={(e) => setF({ ...f, target_slug: e.target.value })} className="w-full mt-1 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm">
              <option value="">Choose product</option>
              {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
          )}
          {f.applies_to === "all" && <div className="mt-1 text-xs text-neutral-500 py-2">— Applies globally</div>}
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-neutral-500">Starts</label>
          <input type="datetime-local" value={f.starts_at} onChange={(e) => setF({ ...f, starts_at: e.target.value })} className="w-full mt-1 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-neutral-500">Ends</label>
          <input type="datetime-local" value={f.ends_at} onChange={(e) => setF({ ...f, ends_at: e.target.value })} className="w-full mt-1 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2 flex items-center gap-6">
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={f.is_featured_sale} onChange={(e) => setF({ ...f, is_featured_sale: e.target.checked })} /> Featured sale</label>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Apply immediately</label>
        </div>
        <div className="col-span-2">
          <button className="pl-btn pl-btn-primary"><Plus className="w-4 h-4" /> Create Discount</button>
        </div>
      </form>

      <div className="bg-neutral-900 border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-neutral-500 text-left">
            <tr><th className="p-4">Name</th><th>Value</th><th>Applies to</th><th>Window</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-t border-neutral-800">
                <td className="p-3">{d.name}{d.is_featured_sale && <span className="ml-2 text-[10px] uppercase text-[color:var(--pl-orange)]">Featured</span>}</td>
                <td>{d.type === "percent" ? `${d.value}%` : `₹${d.value}`}</td>
                <td className="text-neutral-400">{d.applies_to}{d.target_slug ? ` · ${d.target_slug}` : ""}</td>
                <td className="text-xs text-neutral-400">{d.starts_at ? formatDate(d.starts_at) : "—"} → {d.ends_at ? formatDate(d.ends_at) : "∞"}</td>
                <td className="text-xs text-neutral-500">{formatDate(d.created_at)}</td>
                <td className="text-right pr-3"><button onClick={() => del(d.id)} className="p-2 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-neutral-500">No discounts yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Discounts;
