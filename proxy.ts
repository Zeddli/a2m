import { auth0 } from "./lib/auth0";

// Next.js 16+ "proxy" entrypoint for the Auth0 SDK.
// This makes Auth0's `/auth/*` routes work in an App Router project.
export async function proxy(request: Request) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};

