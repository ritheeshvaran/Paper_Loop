import { API, BACKEND_URL } from "@/lib/api";

/** Resolve a media URL — supports absolute URLs, protocol-relative,
 * and backend-relative paths like "/api/uploads/foo.png". */
export const resolveMedia = (url) => {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url)) return url;
  if (url.startsWith("/api/")) {
    const origin = BACKEND_URL || (typeof window !== "undefined" ? window.location.origin : "");
    return origin + url;
  }
  return url;
};
