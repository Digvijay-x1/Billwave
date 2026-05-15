import pc from "picocolors";

export const BILLWAVE_BANNER = `
  ${pc.yellow("▓▒░")} ${pc.bold("BILLWAVE")} ${pc.dim("billing infrastructure for AI SaaS")}
`;
export function printBrand() {
  console.log(BILLWAVE_BANNER);
}
