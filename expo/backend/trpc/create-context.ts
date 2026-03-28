import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import { verifySessionToken, type SessionPayload } from "@/backend/lib/jwt";
import superjson from "superjson";

export interface AuthenticatedRequestContext {
  user: SessionPayload | null;
}

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  let user: SessionPayload | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      user = verifySessionToken(token);
    } catch (error) {
      console.error("[tRPC createContext] Failed to verify session token", error);
    }
  }

  return {
    req: opts.req,
    user,
  } satisfies AuthenticatedRequestContext & { req: Request };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure;
