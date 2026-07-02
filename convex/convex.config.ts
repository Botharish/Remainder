import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();

// Better Auth stores its own auth tables (user/session/account/verification)
// inside this component. Our application tables live in schema.ts.
app.use(betterAuth);

export default app;
