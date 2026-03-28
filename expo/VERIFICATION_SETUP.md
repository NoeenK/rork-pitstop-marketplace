# Email Verification Setup Instructions

## Overview
This app now uses a custom 6-digit code verification system instead of Supabase's built-in email verification.

## How It Works
1. When a user signs up, a 6-digit code is generated and stored in the database
2. The code is "sent" to the user (currently logged to console)
3. User enters the code in the app
4. App validates the code against the database
5. If valid, user proceeds to the welcome screen

## Database Setup

### Step 1: Run the Schema Update
Go to your Supabase SQL Editor and run the `supabase-schema.sql` file, or specifically run this SQL:

```sql
-- Email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
  used BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON email_verification_codes(expires_at);

ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert verification codes (needed during signup)
CREATE POLICY "Anyone can create verification codes" ON email_verification_codes
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read verification codes for their email
CREATE POLICY "Users can read verification codes for their email" ON email_verification_codes
  FOR SELECT USING (true);

-- Grant access
GRANT ALL ON email_verification_codes TO anon, authenticated;
```

### Step 2: Configure Supabase Auth Settings

In your Supabase Dashboard:
1. Go to Authentication → Settings
2. Under "Email Auth", make sure:
   - **Enable email confirmations** is DISABLED (we're using our own system)
   - Or set it to enabled but we override it with our custom flow

## Email Sending Setup (Optional)

Currently, verification codes are logged to the console. To send real emails, you have two options:

### Option A: Use Supabase Edge Functions (Recommended)

Create a Supabase Edge Function to send emails via your preferred email service:

1. Install Supabase CLI
2. Create an Edge Function:
```bash
supabase functions new send-verification-email
```

3. Implement the function to send emails via SendGrid, Mailgun, or Resend

4. Update `lib/verification.ts`:
```typescript
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const response = await fetch('YOUR_SUPABASE_FUNCTION_URL/send-verification-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send verification email');
  }
}
```

### Option B: Use a Third-Party Email Service Directly

Update `lib/verification.ts` to call your email API:

```typescript
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  // Example using Resend
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Verify your email',
      html: `<p>Your verification code is: <strong>${code}</strong></p>`
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send verification email');
  }
}
```

## Testing

For development, check your console logs. When a user signs up, you'll see:
```
==============================================
📧 VERIFICATION CODE FOR user@example.com: 123456
==============================================
```

Use this code to verify the email in the app.

## Security Features

- Codes expire after 15 minutes
- Codes can only be used once
- Codes are validated against the database
- Failed attempts are logged

## Troubleshooting

### "Token has expired or is invalid"
This error is now resolved by using our custom verification system instead of Supabase's OTP.

### Code not working
- Check that the email matches exactly (case-insensitive)
- Check that the code hasn't expired (15 minutes)
- Check that the code hasn't been used already
- Look at console logs for detailed error messages
