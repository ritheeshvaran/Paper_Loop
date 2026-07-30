import { API } from "@/lib/api";

/** Resolve a media URL — supports absolute URLs, protocol-relative,
 * and backend-relative paths like "/api/uploads/foo.png". */
export const resolveMedia = (url) => {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url)) return url;
  if (url.startsWith("/api/")) return API.replace(/\/api$/, "") + url;
  return url;
};
