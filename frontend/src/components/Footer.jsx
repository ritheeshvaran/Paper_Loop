import React from "react";
import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export const Footer = ({ settings }) => {
  return (
    <footer data-testid="site-footer" className="pl-section-dark relative overflow-hidden">
      <div className="pl-container py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h2 className="font-display text-editorial uppercase leading-none">
              Posters.<br />Keychains.<br /><span className="text-[color:var(--pl-orange)]">Your Style.</span>
            </h2>
            <p className="mt-6 text-white/60 max-w-md text-sm leading-relaxed">
              Premium wall art and pocket flex for the ones who curate their space with intent.
            </p>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-4">Shop</div>
            <ul className="space-y-2 text-sm">
              {["anime", "cars", "sports", "gaming", "movies", "music", "motivational", "keychains"].map((c) => (
                <li key={c}><Link to={`/collections/${c}`} className="text-white/80 hover:text-[color:var(--pl-orange)] uppercase tracking-wider text-xs">{c}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-4">Reach us</div>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2"><Instagram className="w-4 h-4" /><a href={settings?.instagram_url || "#"} target="_blank" rel="noreferrer" className="hover:text-[color:var(--pl-orange)]">Instagram</a></li>
              <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /><a href={settings?.whatsapp_url || "#"} target="_blank" rel="noreferrer" className="hover:text-[color:var(--pl-orange)]">WhatsApp</a></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /><a href={`mailto:${settings?.contact_email || ""}`} className="hover:text-[color:var(--pl-orange)]">{settings?.contact_email || "hello@paperandloop.com"}</a></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{settings?.contact_phone}</span></li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{settings?.address}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/40 uppercase tracking-widest">
          <div>© {new Date().getFullYear()} Paper &amp; Loop. All rights reserved.</div>
          <div className="flex gap-6">
            <span>No delivery charges</span>
            <span>Secure UPI payment</span>
            <span>Fast dispatch</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
