import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/redis";

export type CategoryAttributeField = {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
};

export async function getCategoryTree() {
  return cached("categories:tree", 300, async () => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    const byParent = new Map<string | null, typeof categories>();
    for (const category of categories) {
      const list = byParent.get(category.parentId) ?? [];
      list.push(category);
      byParent.set(category.parentId, list);
    }

    type Node = (typeof categories)[number] & { children: Node[] };

    function build(parentId: string | null): Node[] {
      return (byParent.get(parentId) ?? []).map((category) => ({
        ...category,
        children: build(category.id),
      }));
    }

    return build(null);
  });
}

export async function getAllCategoriesFlat() {
  return cached("categories:flat", 300, () =>
    prisma.category.findMany({ orderBy: { name: "asc" } })
  );
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export function getCategoryAttributeFields(
  attributesSchema: unknown
): CategoryAttributeField[] {
  if (!Array.isArray(attributesSchema)) return [];
  return attributesSchema as CategoryAttributeField[];
}
