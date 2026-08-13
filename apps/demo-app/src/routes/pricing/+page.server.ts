import { billwave } from "$lib/server/billwave";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();

  try {
    const plansRes = await billwave.plans();
    return {
      plans: plansRes.plans || [],
      user,
    };
  } catch (e) {
    console.error("Error fetching plans:", e);
    return {
      plans: [],
      user,
    };
  }
};
