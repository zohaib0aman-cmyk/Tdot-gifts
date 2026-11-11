import { body, route } from "@/lib/api";
import { computeQuote, quoteInputSchema } from "@/lib/quote";

export const POST = route(async (req) => computeQuote(await body(req, quoteInputSchema)));
