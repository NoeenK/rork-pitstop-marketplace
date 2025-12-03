import { createHmac } from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  console.warn("[JWT] SESSION_SECRET is not set. Session token generation will fail until configured.");
}

const base64UrlEncode = (value: string) => Buffer.from(value).toString("base64url");
const base64UrlDecode = (value: string) => Buffer.from(value, "base64url").toString("utf-8");

export interface SessionPayload {
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string | null;
  exp: number;
  iat: number;
}

export const createSessionToken = (payload: Omit<SessionPayload, "iat" | "exp">, expiresInSeconds = 60 * 60 * 24 * 7) => {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required to create session tokens");
  }

  const header = { alg: "HS256", typ: "JWT" };
  const issuedAt = Math.floor(Date.now() / 1000);
  const exp = issuedAt + expiresInSeconds;

  const fullPayload: SessionPayload = {
    ...payload,
    iat: issuedAt,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createHmac("sha256", SESSION_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifySessionToken = (token: string): SessionPayload | null => {
  if (!SESSION_SECRET) {
    console.warn("[JWT] SESSION_SECRET is not set. Unable to verify tokens.");
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = createHmac("sha256", SESSION_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  if (expectedSignature !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (error) {
    console.error("[JWT] Failed to parse session token payload", error);
    return null;
  }
};
