import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "../db.js";
import { createToken, setCookieToken } from "../services/tokenService.js";

const router = express.Router();

const AVATAR_FALLBACK = "https://i.pravatar.cc/100?u=zz";

// HELPERS
async function checkLinkedAccount(provider, id) {
  const result = await db.query(
    "SELECT user_id FROM users_linked_accounts WHERE provider_name = $1 AND provider_id = $2;",
    [provider, id],
  );

  // No account found
  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].user_id;
}

function extractVerifiedEmails(emailArr) {
  return emailArr
    .filter((emailObj) => emailObj.verified === true)
    .map((emailObj) => emailObj.value);
}

async function checkExistingEmail(emailArr) {
  const result = await db.query(
    "SELECT id, email FROM users WHERE email = ANY($1::text[]);",
    [emailArr],
  );

  return result.rows;
}

async function CreateUserWithoutEmail(profileData) {
  const avatar = profileData.photos?.[0]?.value || AVATAR_FALLBACK;

  // create user
  const result = await db.query(
    "INSERT INTO users(name, avatar) VALUES ($1, $2) RETURNING *;",
    [profileData.displayName, avatar],
  );
  const user = result.rows[0];

  // create linked accout
  try {
    await db.query(
      "INSERT INTO users_linked_accounts(user_id, provider_name, provider_id, raw_email) VALUES ($1, $2, $3, $4);",
      [
        user.id,
        profileData.provider,
        profileData.id,
        JSON.stringify(profileData.emails),
      ],
    );

    return user.id;
  } catch (err) {
    // clean up on linked account creation failure
    await db.query("DELETE FROM users WHERE id = $1;", [user.id]);
    throw err;
  }
}

async function LinkUserByEmail(userData, profileData) {
  const result = await db.query(
    "INSERT INTO users_linked_accounts(user_id, provider_name, provider_id, linked_email, raw_email) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [
      userData.id,
      profileData.provider,
      profileData.id,
      userData.email,
      JSON.stringify(profileData.emails),
    ],
  );

  return result.rows[0].user_id;
}

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
          return done(null, userId);
        }

        // 2) User not existing -> extract verified email array from profile
        const verifiedEmails = extractVerifiedEmails(profile.emails);

        // A) No Verified Email -> create account without email (only enable oauth)
        if (verifiedEmails.length === 0) {
          const newUserId = await CreateUserWithoutEmail(profile);
          return done(null, newUserId);
        }

        // B) Verified Email Exists -> check match user email
        const userArr = await checkExistingEmail(verifiedEmails);

        // a) no match -> create account without email (only enable oauth)
        if (userArr.length === 0) {
          const newUserId = await CreateUserWithoutEmail(profile);
          return done(null, newUserId);
        }

        // b) single match -> link user
        if (userArr.length === 1) {
          const linkedUserId = await LinkUserByEmail(userArr[0], profile);
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
