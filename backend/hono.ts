import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { getSupabaseAdmin } from "@/backend/lib/supabase-admin";
import { createSessionToken, verifySessionToken } from "@/backend/lib/jwt";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { randomUUID } from "crypto";

const COOKIE_STATE_KEY = "pitstop_google_state";
const COOKIE_REDIRECT_KEY = "pitstop_google_redirect";
const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_TOKENINFO_ENDPOINT = "https://oauth2.googleapis.com/tokeninfo";

const app = new Hono();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

const isProduction = process.env.NODE_ENV === "production";

app.get("/api/auth/google/start", (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const appRedirect = c.req.query("app_redirect");

  if (!clientId || !redirectUri) {
    return c.json({ error: "Google OAuth is not configured." }, 500);
  }

  if (!appRedirect) {
    return c.json({ error: "Missing app_redirect." }, 400);
  }

  const state = randomUUID();

  setCookie(c, COOKIE_STATE_KEY, state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 600,
    path: "/",
  });

  setCookie(c, COOKIE_REDIRECT_KEY, encodeURIComponent(appRedirect), {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return c.redirect(`${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`);
});

app.get("/api/auth/google/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  const storedState = getCookie(c, COOKIE_STATE_KEY);
  const storedRedirect = getCookie(c, COOKIE_REDIRECT_KEY);

  deleteCookie(c, COOKIE_STATE_KEY, { path: "/" });
  deleteCookie(c, COOKIE_REDIRECT_KEY, { path: "/" });

  const appRedirect = storedRedirect ? decodeURIComponent(storedRedirect) : undefined;
  const fallbackRedirect = process.env.APP_SCHEME_REDIRECT ?? "pitstop://auth/google-callback";
  const finalRedirect = new URL(appRedirect || fallbackRedirect);

  if (!clientId || !clientSecret || !redirectUri) {
    finalRedirect.searchParams.set("status", "error");
    finalRedirect.searchParams.set("message", "Google OAuth is not configured.");
    return c.redirect(finalRedirect.toString());
  }

  if (!code || !state) {
    finalRedirect.searchParams.set("status", "error");
    finalRedirect.searchParams.set("message", "Missing code or state.");
    return c.redirect(finalRedirect.toString());
  }

  if (!storedState || storedState !== state) {
    finalRedirect.searchParams.set("status", "error");
    finalRedirect.searchParams.set("message", "OAuth state mismatch.");
    return c.redirect(finalRedirect.toString());
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorPayload = await tokenResponse.json().catch(() => ({}));
      console.error("[Google OAuth] Token exchange failed", errorPayload);
      finalRedirect.searchParams.set("status", "error");
      finalRedirect.searchParams.set("message", "Failed to exchange authorization code.");
      return c.redirect(finalRedirect.toString());
    }

    const tokenData = await tokenResponse.json() as {
      access_token: string;
      id_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
      scope?: string;
    };

    const tokenInfoResponse = await fetch(`${GOOGLE_TOKENINFO_ENDPOINT}?id_token=${tokenData.id_token}`);
    if (!tokenInfoResponse.ok) {
      const errorPayload = await tokenInfoResponse.json().catch(() => ({}));
      console.error("[Google OAuth] Token verification failed", errorPayload);
      finalRedirect.searchParams.set("status", "error");
      finalRedirect.searchParams.set("message", "Failed to verify Google ID token.");
      return c.redirect(finalRedirect.toString());
    }

    const tokenInfo = await tokenInfoResponse.json() as {
      aud: string;
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      given_name?: string;
      family_name?: string;
      email_verified?: string;
    };

    if (tokenInfo.aud !== clientId) {
      console.error("[Google OAuth] Audience mismatch", tokenInfo);
      finalRedirect.searchParams.set("status", "error");
      finalRedirect.searchParams.set("message", "Invalid ID token audience.");
      return c.redirect(finalRedirect.toString());
    }

    const supabase = getSupabaseAdmin();

    const existingUser = await supabase.auth.admin.getUserByEmail(tokenInfo.email);
    let userId = existingUser.data?.user?.id;

    if (!userId) {
      const createdUser = await supabase.auth.admin.createUser({
        email: tokenInfo.email,
        email_confirm: tokenInfo.email_verified === "true",
        app_metadata: {
          provider: "google",
        },
        user_metadata: {
          full_name: tokenInfo.name,
          avatar_url: tokenInfo.picture,
          google_sub: tokenInfo.sub,
        },
      });

      if (createdUser.error || !createdUser.data?.user?.id) {
        console.error("[Google OAuth] Unable to create user", createdUser.error);
        finalRedirect.searchParams.set("status", "error");
        finalRedirect.searchParams.set("message", "Unable to create user");
        return c.redirect(finalRedirect.toString());
      }

      userId = createdUser.data.user.id;
    } else {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: tokenInfo.name,
          avatar_url: tokenInfo.picture,
          google_sub: tokenInfo.sub,
        },
      });
    }

    let profileDisplayName: string | undefined;
    let profileAvatarUrl: string | null | undefined;

    if (userId) {
      const profileResult = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (profileResult.error) {
        console.error("[Google OAuth] Failed to fetch profile", profileResult.error);
      }

      if (!profileResult.data) {
        const insertResult = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: tokenInfo.email,
            full_name: tokenInfo.name ?? null,
            display_name: tokenInfo.name ?? tokenInfo.email,
            avatar_url: tokenInfo.picture ?? null,
          })
          .select("display_name, avatar_url")
          .maybeSingle();

        if (insertResult.error) {
          console.error("[Google OAuth] Failed to insert profile", insertResult.error);
        } else {
          profileDisplayName = insertResult.data?.display_name ?? tokenInfo.name ?? tokenInfo.email;
          profileAvatarUrl = insertResult.data?.avatar_url ?? tokenInfo.picture ?? null;
        }
      } else {
        profileDisplayName = profileResult.data.display_name ?? tokenInfo.name ?? tokenInfo.email;
        profileAvatarUrl = profileResult.data.avatar_url ?? tokenInfo.picture ?? null;

        const shouldUpdateProfile =
          !profileResult.data.display_name ||
          profileResult.data.display_name !== (tokenInfo.name ?? tokenInfo.email) ||
          (!profileResult.data.avatar_url && tokenInfo.picture);

        if (shouldUpdateProfile) {
          const updateResult = await supabase
            .from("profiles")
            .update({
              display_name: tokenInfo.name ?? tokenInfo.email,
              avatar_url: tokenInfo.picture ?? profileResult.data.avatar_url ?? null,
            })
            .eq("id", userId);

          if (updateResult.error) {
            console.error("[Google OAuth] Failed to update profile", updateResult.error);
          }
        }
      }
    }

    const sessionToken = createSessionToken({
      userId: userId ?? tokenInfo.sub,
      email: tokenInfo.email,
      displayName: profileDisplayName ?? tokenInfo.name,
      avatarUrl: profileAvatarUrl ?? tokenInfo.picture ?? null,
    });

    finalRedirect.searchParams.set("status", "success");
    finalRedirect.searchParams.set("token", sessionToken);
    finalRedirect.searchParams.set("id_token", tokenData.id_token);
    if (tokenData.refresh_token) {
      finalRedirect.searchParams.set("refresh_token", tokenData.refresh_token);
    }

    return c.redirect(finalRedirect.toString());
  } catch (error) {
    console.error("[Google OAuth] Unexpected error", error);
    finalRedirect.searchParams.set("status", "error");
    finalRedirect.searchParams.set("message", "Unexpected error occurred.");
    return c.redirect(finalRedirect.toString());
  }
});

app.get("/api/auth/session", async (c) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7).trim();
  const payload = verifySessionToken(token);

  if (!payload) {
    return c.json({ error: "Invalid session" }, 401);
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url")
      .eq("id", payload.userId)
      .maybeSingle();

    if (error) {
      console.error("[Session] Failed to fetch profile", error);
      return c.json({ error: "Profile lookup failed" }, 500);
    }

    if (!profileData) {
      return c.json({
        user: {
          id: payload.userId,
          email: payload.email,
          displayName: payload.displayName ?? payload.email,
          avatarUrl: payload.avatarUrl ?? null,
        },
      });
    }

    return c.json({
      user: {
        id: profileData.id,
        email: profileData.email,
        displayName: profileData.display_name ?? payload.displayName ?? profileData.email,
        avatarUrl: profileData.avatar_url ?? payload.avatarUrl ?? null,
      },
    });
  } catch (error) {
    console.error("[Session] Unexpected error", error);
    return c.json({ error: "Failed to fetch session" }, 500);
  }
});

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
