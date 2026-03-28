import { supabaseClient } from './supabase';

export async function sendVerificationCode(email: string): Promise<void> {
  const trimmedEmail = email.toLowerCase().trim();
  
  console.log('[Verification] Sending OTP to:', trimmedEmail);
  
  const { error } = await supabaseClient.auth.signInWithOtp({
    email: trimmedEmail,
    options: {
      shouldCreateUser: true,
    }
  });

  if (error) {
    console.error('[Verification] Failed to send OTP:', error);
    throw error;
  }

  console.log('[Verification] OTP sent successfully to:', trimmedEmail);
}

export async function verifyEmailCode(email: string, token: string): Promise<boolean> {
  const trimmedEmail = email.toLowerCase().trim();
  const trimmedToken = token.trim();

  console.log('[Verification] Verifying OTP for:', trimmedEmail);

  const { data, error } = await supabaseClient.auth.verifyOtp({
    email: trimmedEmail,
    token: trimmedToken,
    type: 'email',
  });

  if (error) {
    console.error('[Verification] OTP verification failed:', error);
    return false;
  }

  if (!data.session) {
    console.error('[Verification] No session created after OTP verification');
    return false;
  }

  console.log('[Verification] OTP verified successfully');
  return true;
}

export async function generateVerificationCode(email: string): Promise<string> {
  await sendVerificationCode(email);
  return '';
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  await sendVerificationCode(email);
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  return await verifyEmailCode(email, code);
}
