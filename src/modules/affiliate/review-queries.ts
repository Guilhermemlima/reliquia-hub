import { prisma } from "@/lib/prisma";

export async function getPendingMatchReviews() {
  return prisma.offerMatchReview.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { candidatePart: true },
  });
}

export async function getMatchReviewCount() {
  return prisma.offerMatchReview.count({ where: { status: "PENDING" } });
}
