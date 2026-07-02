/**
 * Tells Convex how to validate the JWTs minted by Better Auth's `convex`
 * plugin. The issuer is this deployment's own `.site` URL.
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
