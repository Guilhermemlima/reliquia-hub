"use server";

import { computeStrategies } from "@/modules/builder/queries";

export async function computeBuild(partIds: string[]) {
  return computeStrategies(partIds);
}
