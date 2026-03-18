import express from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";

const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // profile contains: id, displayName, emails, photos, etc.
      console.log(profile);

      // Find or create user in DB, then call done()
      done(null, { id: profile.id, name: profile.displayName });
    },
  ),
);

// Auth route
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Callback route
router.get("/callback", passport.authenticate("google"));

export default router;
