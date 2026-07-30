import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/account";
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: params.get("email") || "", password: "", confirm: "", name: "", phone: "",
    address_line1: "", address_line2: "", city: "", state: "", pincode: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    setBusy(true);
    try {
      const { confirm, ...payload } = form;
      await register(payload);
      toast.success("Welcome to Paper & Loop.");
      nav(next);
    } catch (err) {
      setError(err.response?.data?.detail || "Sign-up failed.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block relative bg-[color:var(--pl-black)] text-white overflow-hidden">
        <img src="https://images.unsplash.com/photo-1523585298601-d46ae038d7d3?w=1600" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black" />
        <div className="relative z-10 p-12 h-full flex flex-col justify-between">
          <Link to="/" className="text-white uppercase tracking-widest text-xs flex items-center gap-2"><ArrowLeft className="w-3 h-3" /> Back to Paper &amp; Loop</Link>
          <div>
            <div className="text-[11px] tracking-[0.25em] uppercase text-[color:var(--pl-orange)] mb-4">Join The Drop List</div>
            <h1 className="font-display uppercase text-5xl leading-none">Your wall.<br /><span className="text-[color:var(--pl-orange)]">Your rules.</span></h1>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 md:p-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-[11px] uppercase tracking-widest text-neutral-500 mb-2">New Customer</div>
          <h2 className="font-display uppercase text-3xl">Create account.</h2>

          <form onSubmit={submit} className="mt-8 grid grid-cols-2 gap-4">
            {[
              ["name", "Full name", "text", true, 2],
              ["email", "Email", "email", true, 2],
              ["phone", "Phone", "tel", false, 2],
              ["password", "Password", "password", true, 1],
              ["confirm", "Confirm password", "password", true, 1],
              ["address_line1", "Address line 1", "text", false, 2],
              ["address_line2", "Address line 2", "text", false, 2],
              ["city", "City", "text", false, 1],
              ["state", "State", "text", false, 1],
              ["pincode", "Pincode", "text", false, 2],
            ].map(([key, label, type, req, span]) => (
              <div key={key} className={span === 2 ? "col-span-2" : "col-span-2 md:col-span-1"}>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500">{label}{req ? " *" : ""}</label>
                <input
                  data-testid={`register-${key}`}
                  type={type} required={req}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full mt-1 border-b border-neutral-300 focus:border-black bg-transparent py-2 focus:outline-none"
                />
              </div>
            ))}
            {error && <div data-testid="register-error" className="col-span-2 text-sm text-red-600">{error}</div>}
            <div className="col-span-2">
              <button data-testid="register-submit" disabled={busy} className="pl-btn pl-btn-primary w-full">{busy ? "Creating…" : "Create Account"}</button>
            </div>
          </form>

          <div className="mt-6 text-sm text-neutral-600">
            Already have an account? <Link to={`/login?next=${encodeURIComponent(next)}`} data-testid="link-login" className="text-black underline hover:text-[color:var(--pl-orange)] uppercase tracking-widest text-xs font-bold">Sign in →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default Register;
