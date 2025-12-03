import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { sendVerificationCodeProcedure, verifyCodeProcedure } from "./routes/auth/send-verification-code/route";
import { sendMessageProcedure } from "./routes/chat/send-message/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    sendVerificationCode: sendVerificationCodeProcedure,
    verifyCode: verifyCodeProcedure,
  }),
  chat: createTRPCRouter({
    sendMessage: sendMessageProcedure,
  }),
});

export type AppRouter = typeof appRouter;
