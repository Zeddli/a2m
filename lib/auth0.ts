import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Auth0 client singleton.
// The SDK reads configuration from environment variables like AUTH0_DOMAIN, AUTH0_CLIENT_ID, etc.
export const auth0 = new Auth0Client();

