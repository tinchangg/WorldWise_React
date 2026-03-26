import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { createToken, setCookieToken } from "../services/tokenService.js";
import {
  updateLastLogin,
  checkExistingEmail,
  checkLinkedAccount,
  createUserWithoutEmail,
  linkUserByEmail,
} from "../services/userService.js";

const router = express.Router();

// HELPERS
function extractVerifiedEmails(emailArr) {
  return emailArr
    .filter((emailObj) => emailObj.verified === true)
    .map((emailObj) => emailObj.value);
}

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // profile contains: id, displayName, emails, photos, etc.
      // console.log(profile);
      // profile clean up

      try {
        // Check existing profile
        const userId = await checkLinkedAccount(profile.provider, profile.id);

        // 1) User existing
        if (userId) {
          await updateLastLogin(userId);
          return done(null, userId);
        }

        // 2) User not existing -> extract verified email array from profile
        const verifiedEmails = extractVerifiedEmails(profile.emails);

        // A) No Verified Email -> create account without email (only enable oauth)
        if (verifiedEmails.length === 0) {
          const newUserId = await createUserWithoutEmail(profile);
          return done(null, newUserId);
        }

        // B) Verified Email Exists -> check match user email
        const userArr = await checkExistingEmail(verifiedEmails);

        // a) no match -> create account without email (only enable oauth)
        if (userArr.length === 0) {
          const newUserId = await createUserWithoutEmail(profile);
          return done(null, newUserId);
        }

        // b) single match -> link user
        if (userArr.length === 1) {
          const linkedUserId = await linkUserByEmail(userArr[0], profile);
          await updateLastLogin(linkedUserId);
          return done(null, linkedUserId);
        }

        // c) multiple matches -> CONFLICT
        return done(
          new Error("Please log in with your password or contact support."),
        );
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// Auth route
router.get(
  "/",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Callback route
router.get(
  "/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    // Create JWT
    const userPayload = { id: req.user };
    const token = createToken(userPayload);
    // Send token in cookie and redirect to frontend
    setCookieToken(res, token);
    res.redirect(`${process.env.FRONTEND_URL}/app`);
  },
);

export default router;
