import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@/backend/trpc/app-router";
import { getSessionToken, loadSessionTokenFromStorage } from "@/lib/session";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export function getTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers: async () => {
          let token = getSessionToken();
          if (!token) {
            token = await loadSessionTokenFromStorage();
          }

          return {
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          };
        },
        fetch: async (url, options) => {
          console.log('[tRPC Client] Making request to:', url);
          console.log('[tRPC Client] Request options:', JSON.stringify({
            method: options?.method,
            headers: options?.headers,
          }));
          
          try {
            const response = await fetch(url, options);
            console.log('[tRPC Client] Response status:', response.status);
            console.log('[tRPC Client] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
            
            const contentType = response.headers.get('content-type');
            console.log('[tRPC Client] Content-Type:', contentType);
            
            if (!response.ok || !contentType?.includes('application/json')) {
              const text = await response.clone().text();
              console.error('[tRPC Client] Non-JSON or error response:', text.substring(0, 500));
              
              if (!contentType?.includes('application/json')) {
                throw new Error(
                  'Backend returned non-JSON response. This usually means the backend is not running or the URL is incorrect. ' +
                  `Expected JSON but got: ${contentType}. Response: ${text.substring(0, 100)}`
                );
              }
            }
            
            return response;
          } catch (error) {
            console.error('[tRPC Client] Fetch error:', error);
            throw error;
          }
        },
      }),
    ],
  });
}
