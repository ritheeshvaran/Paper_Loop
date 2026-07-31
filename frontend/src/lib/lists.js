/** Normalize list API payloads — backend returns raw arrays; guard wrapped/HTML/error bodies. */
export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  if (value && Array.isArray(value.products)) return value.products;
  if (value && Array.isArray(value.items)) return value.items;
  return [];
}

/** Safe slice + map for list rendering. */
export function sliceMap(value, count, render) {
  return asArray(value).slice(0, count).map(render);
}
