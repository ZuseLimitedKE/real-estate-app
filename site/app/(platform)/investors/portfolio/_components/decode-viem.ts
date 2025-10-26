import { formatUnits, parseUnits, BaseError, ContractFunctionRevertedError } from "viem";

export function decodeViemError(e: any): string {
  try {
    if (e instanceof BaseError) {
      const revert = e.walk((err) => err instanceof ContractFunctionRevertedError);
      if (revert) {
        // Prefer decoded custom error name or reason
        // @ts-expect-error viem typed errors carry details
        return revert.shortMessage || revert.reason || revert.message;
      }
      return e.shortMessage || e.message;
    }
    return e?.message || String(e);
  } catch {
    return "Transaction failed";
  }
}