const { auth } = require("express-oauth2-jwt-bearer");

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw new Error("Missing AUTH0_DOMAIN or AUTH0_AUDIENCE in .env");
}

const requireAuth = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  audience: process.env.AUTH0_AUDIENCE,
  tokenSigningAlg: "RS256",
});

module.exports = { requireAuth };
