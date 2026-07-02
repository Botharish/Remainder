import { httpRouter } from "convex/server";
import { betterAuthComponent, createAuth } from "./auth";

const http = httpRouter();

// Mounts all Better Auth HTTP routes (sign-in, sign-up, oauth callbacks,
// session, sign-out, ...) on the Convex deployment's `.site` domain. The
// Next.js app proxies /api/auth/* to these routes (see app/api/auth/[...all]).
betterAuthComponent.registerRoutes(http, createAuth);

export default http;
