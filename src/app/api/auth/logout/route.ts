import { route } from "@/lib/api";
import { endCustomerSession } from "@/lib/auth";

export const POST = route(async () => { await endCustomerSession(); return { ok: true }; });
