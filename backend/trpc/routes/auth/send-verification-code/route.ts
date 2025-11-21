import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getSupabaseAdmin } from "@/backend/lib/supabase-admin";

const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendVerificationCodeProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .mutation(async ({ input }) => {
    const { email } = input;
    const normalizedEmail = email.toLowerCase().trim();

    console.log("[SendVerificationCode] Generating code for:", normalizedEmail);

    const code = generateSixDigitCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    verificationCodes.set(normalizedEmail, { code, expiresAt });

    console.log("[SendVerificationCode] Generated code:", code, "for:", normalizedEmail);

    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: normalizedEmail,
      });

      if (error) {
        console.error("[SendVerificationCode] Supabase error:", error);
      }

      console.log("[SendVerificationCode] Email sent successfully");
      console.log("[SendVerificationCode] VERIFICATION CODE FOR", normalizedEmail, ":", code);

      return { success: true, message: "Verification code sent to your email" };
    } catch (error) {
      console.error("[SendVerificationCode] Failed to send email:", error);
      throw new Error("Failed to send verification code. Please try again.");
    }
  });

export const verifyCodeProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      code: z.string().length(6),
    })
  )
  .mutation(async ({ input }) => {
    const { email, code } = input;
    const normalizedEmail = email.toLowerCase().trim();

    console.log("[VerifyCode] Verifying code for:", normalizedEmail);

    const stored = verificationCodes.get(normalizedEmail);

    if (!stored) {
      console.error("[VerifyCode] No code found for:", normalizedEmail);
      return { success: false, message: "No verification code found. Please request a new one." };
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(normalizedEmail);
      console.error("[VerifyCode] Code expired for:", normalizedEmail);
      return { success: false, message: "Verification code has expired. Please request a new one." };
    }

    if (stored.code !== code) {
      console.error("[VerifyCode] Invalid code for:", normalizedEmail);
      return { success: false, message: "Invalid verification code." };
    }

    verificationCodes.delete(normalizedEmail);
    console.log("[VerifyCode] Code verified successfully for:", normalizedEmail);

    return { success: true, message: "Email verified successfully" };
  });

export default sendVerificationCodeProcedure;
