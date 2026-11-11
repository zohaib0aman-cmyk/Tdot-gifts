import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { HttpError, requireAdmin } from "./auth";

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response | unknown>;

/** Wraps a route handler with JSON responses, zod error formatting, CSRF origin check and optional admin guard. */
export function route<C = unknown>(fn: Handler<C>, opts: { admin?: boolean } = {}) {
  return async (req: NextRequest, ctx: C) => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        const origin = req.headers.get("origin");
        const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
        if (origin && host && new URL(origin).host !== host) throw new HttpError(403, "Cross-site request blocked");
      }
      if (opts.admin) await requireAdmin();
      const out = await fn(req, ctx);
      if (out instanceof Response) return out;
      return NextResponse.json(out ?? { ok: true });
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError) {
        const first = e.issues[0];
        return NextResponse.json({ error: first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid input", issues: e.issues }, { status: 400 });
      }
      console.error("[api]", e);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export async function body<T extends z.ZodType>(req: NextRequest, schema: T): Promise<z.infer<T>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  return schema.parse(json);
}

export const clientIp = (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
