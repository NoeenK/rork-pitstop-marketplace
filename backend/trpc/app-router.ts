import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { sendVerificationCodeProcedure, verifyCodeProcedure } from "./routes/auth/send-verification-code/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    sendVerificationCode: sendVerificationCodeProcedure,
    verifyCode: verifyCodeProcedure,
  }),
});

export type AppRouter = typeof appRouter;
