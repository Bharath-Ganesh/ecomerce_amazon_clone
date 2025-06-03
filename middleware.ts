import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// Middleware in Next.js runs before requests are completed, acting as a gatekeeper
// Here, we use Clerk's middleware to handle authentication and protect routes
// The matcher configuration below specifies which routes the middleware should run on:
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
