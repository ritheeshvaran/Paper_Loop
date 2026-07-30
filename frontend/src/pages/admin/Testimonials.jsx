import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { resolveMedia } from "@/lib/media";

const Testimonials = () => {
  const [items, setItems] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [t, setT] = useState({ name: "", quote: "", location: "", photo_url: "", rating: 5 });
  const [g, setG] = useState({ image_url: "", caption: "", link_url: "", sort_order: 0 });

  const load = () => { api.get("/testimonials").then((r) => setItems(r.data)); api.get("/gallery").then((r) => setGallery(r.data)); };
  useEffect(() => { load(); }, []);

  const addT = async (e) => { e.preventDefault(); try { await api.post("/admin/testimonials", t); toast.success("Testimonial added"); setT({ name: "", quote: "", location: "", photo_url: "", rating: 5 }); load(); } catch { toast.error("Failed"); } };
  const delT = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/testimonials/${id}`); toast.success("Deleted"); load(); };
  const addG = async (e) => { e.preventDefault(); try { await api.post("/admin/gallery", g); toast.success("Gallery item added"); setG({ image_url: "", caption: "", link_url: "", sort_order: 0 }); load(); } catch { toast.error("Failed"); } };
  const delG = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/gallery/${id}`); toast.success("Deleted"); load(); };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <div className="text-[11px] uppercase tracking-widest text-neutral-500">Social proof</div>
        <h1 className="font-display uppercase text-3xl mt-1 mb-4">Testimonials</h1>
        <form onSubmit={addT} className="bg-neutral-900 border border-neutral-800 p-5 space-y-3 mb-4">
          <input required placeholder="Name" value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input placeholder="Location" value={t.location} onChange={(e) => setT({ ...t, location: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <textarea required placeholder="Quote" rows={3} value={t.quote} onChange={(e) => setT({ ...t, quote: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <div className="flex gap-3">
            <input type="number" min={1} max={5} value={t.rating} onChange={(e) => setT({ ...t, rating: Number(e.target.value) })} className="w-24 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
            <input placeholder="Photo URL (optional)" value={t.photo_url} onChange={(e) => setT({ ...t, photo_url: e.target.value })} className="flex-1 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          </div>
          <button className="pl-btn pl-btn-primary"><Plus className="w-4 h-4" /> Add</button>
        </form>
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="bg-neutral-900 border border-neutral-800 p-4 flex gap-3 items-start">
              <div className="flex-1">
                <div className="text-sm">"{it.quote}"</div>
                <div className="text-xs text-neutral-500 mt-1">— {it.name}{it.location ? ` · ${it.location}` : ""} · {it.rating}★</div>
              </div>
              <button onClick={() => delT(it.id)} className="p-2 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
          {items.length === 0 && <li className="text-sm text-neutral-500">No testimonials yet.</li>}
        </ul>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-widest text-neutral-500">Community wall</div>
        <h1 className="font-display uppercase text-3xl mt-1 mb-4">Gallery</h1>
        <form onSubmit={addG} className="bg-neutral-900 border border-neutral-800 p-5 space-y-3 mb-4">
          <input required placeholder="Image URL" value={g.image_url} onChange={(e) => setG({ ...g, image_url: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input placeholder="Caption" value={g.caption} onChange={(e) => setG({ ...g, caption: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input placeholder="Link URL (optional)" value={g.link_url} onChange={(e) => setG({ ...g, link_url: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input type="number" placeholder="Sort order" value={g.sort_order} onChange={(e) => setG({ ...g, sort_order: Number(e.target.value) })} className="w-32 bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <button className="pl-btn pl-btn-primary"><Plus className="w-4 h-4" /> Add</button>
        </form>
        <div className="grid grid-cols-3 gap-2">
          {gallery.map((it) => (
            <div key={it.id} className="relative aspect-square bg-neutral-800 group">
              <img src={resolveMedia(it.image_url)} alt="" className="w-full h-full object-cover" />
              <button onClick={() => delG(it.id)} className="absolute top-1 right-1 p-1 bg-black/70 text-white opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Testimonials;
