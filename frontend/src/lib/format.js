export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));

export const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) {
    return iso;
  }
};

export const statusLabel = (s) => ({
  placed: "Placed",
  payment_under_validation: "Payment Under Validation",
  approved: "Approved",
  preparing: "Preparing",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}[s] || s);

export const statusColor = (s) => ({
  placed: "bg-neutral-200 text-neutral-900",
  payment_under_validation: "bg-amber-100 text-amber-900",
  approved: "bg-blue-100 text-blue-900",
  preparing: "bg-blue-100 text-blue-900",
  packed: "bg-indigo-100 text-indigo-900",
  out_for_delivery: "bg-indigo-100 text-indigo-900",
  delivered: "bg-green-100 text-green-900",
  cancelled: "bg-red-100 text-red-900",
}[s] || "bg-neutral-200 text-neutral-900");
