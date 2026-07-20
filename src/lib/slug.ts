import slugify from "slugify";

export function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
) {
  const root = toSlug(base) || "item";
  let candidate = root;
  let attempt = 0;

  while (await exists(candidate)) {
    attempt += 1;
    candidate = `${root}-${Math.random().toString(36).slice(2, 6)}${
      attempt > 3 ? attempt : ""
    }`;
  }

  return candidate;
}
