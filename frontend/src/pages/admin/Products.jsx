import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";

const empty = {
  name: "", slug: "", category_slug: "anime", description: "",
  price: 599, discount_percent: 0, stock_quantity: 20,
  images: [""], lifestyle_image: "",
  material: "Premium 250gsm matte paper", size: "A3 (11.7 x 16.5 in)", finish: "Matte",
  is_featured: false, is_trending: false, is_best_seller: false, is_new: true, is_limited: false,
  visibility: "published",
};

const Products = () => {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/products").then((r) => setItems(r.data));
  useEffect(() => { load(); api.get("/categories").then((r) => setCats(r.data)); }, []);

  const openNew = () => { setEditing("new"); setForm({ ...empty, category_slug: cats[0]?.slug || "anime" }); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name, slug: p.slug, category_slug: p.category_slug, description: p.description,
      price: p.price, discount_percent: p.discount_percent || 0, stock_quantity: p.stock_quantity,
      images: p.images?.length ? p.images : [""], lifestyle_image: p.lifestyle_image || "",
      material: p.material, size: p.size, finish: p.finish,
      is_featured: p.is_featured, is_trending: p.is_trending, is_best_seller: p.is_best_seller,
      is_new: p.is_new, is_limited: p.is_limited, visibility: p.visibility,
    });
  };

  const save = async () => {
    const payload = { ...form, images: form.images.filter(Boolean) };
    try {
      if (editing === "new") { await api.post("/admin/products", payload); toast.success("Product created"); }
      else { await api.put(`/admin/products/${editing}`, payload); toast.success("Product updated"); }
      setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`); toast.success("Deleted"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-neutral-500">Catalog</div>
          <h1 className="font-display uppercase text-3xl mt-1">Products ({items.length})</h1>
        </div>
        <button data-testid="admin-new-product" onClick={openNew} className="pl-btn pl-btn-primary"><Plus className="w-4 h-4" /> New Product</button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-neutral-500 text-left">
            <tr><th className="p-4">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-neutral-800 hover:bg-neutral-800/50">
                <td className="p-3 flex items-center gap-3">
                  <img src={p.images?.[0]} alt="" className="w-10 h-12 object-cover bg-neutral-800" />
                  <div>
                    <div>{p.name}</div>
                    <div className="text-xs text-neutral-500 font-mono">{p.slug}</div>
                  </div>
                </td>
                <td className="text-neutral-400 uppercase text-xs">{p.category_slug}</td>
                <td className="font-tabular">
                  {formatINR(p.final_price)}
                  {p.discount_percent > 0 && <span className="ml-2 text-xs text-[color:var(--pl-orange)]">−{p.discount_percent}%</span>}
                </td>
                <td className={p.stock_quantity < 5 ? "text-amber-500" : "text-neutral-300"}>{p.stock_quantity}</td>
                <td className="text-[10px] uppercase tracking-widest text-neutral-400">
                  {[p.is_featured && "Feat", p.is_trending && "Trend", p.is_best_seller && "Best", p.is_new && "New", p.is_limited && "Ltd"].filter(Boolean).join(" · ")}
                </td>
                <td className="text-right pr-3">
                  <button onClick={() => openEdit(p)} className="p-2 hover:text-[color:var(--pl-orange)]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => del(p.id)} className="p-2 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto p-6">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-3xl p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display uppercase text-2xl">{editing === "new" ? "New Product" : "Edit Product"}</h2>
              <button onClick={() => setEditing(null)}><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["name", "Name", 2, "text"], ["slug", "Slug (auto)", 2, "text"],
                ["description", "Description", 2, "textarea"],
                ["price", "Price ₹", 1, "number"], ["discount_percent", "Discount %", 1, "number"],
                ["stock_quantity", "Stock", 1, "number"],
                ["material", "Material", 2, "text"], ["size", "Size", 1, "text"], ["finish", "Finish", 1, "text"],
                ["lifestyle_image", "Lifestyle image URL", 2, "text"],
              ].map(([k, label, span, type]) => (
                <div key={k} className={span === 2 ? "col-span-2" : "col-span-2 md:col-span-1"}>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</label>
                  {type === "textarea" ? (
                    <textarea value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} rows={3} className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:border-neutral-600" />
                  ) : (
                    <input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: type === "number" ? Number(e.target.value) : e.target.value })} className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:border-neutral-600" />
                  )}
                </div>
              ))}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500">Category</label>
                <select value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none">
                  {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500">Visibility</label>
                <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="w-full mt-1 bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Image URLs (comma-separated or one per line)</label>
                <textarea rows={3} value={form.images.join("\n")} onChange={(e) => setForm({ ...form, images: e.target.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean) })} className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none" />
              </div>
              <div className="col-span-2 flex flex-wrap gap-4 pt-2">
                {["is_featured", "is_trending", "is_best_seller", "is_new", "is_limited"].map((k) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />
                    {k.replace("is_", "").replace("_", " ")}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="pl-btn pl-btn-ghost-dark">Cancel</button>
              <button data-testid="admin-save-product" onClick={save} className="pl-btn pl-btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Products;
