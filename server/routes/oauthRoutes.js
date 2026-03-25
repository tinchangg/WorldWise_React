import express from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import db from "../db";

const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // profile contains: id, displayName, emails, photos, etc.
      console.log(profile);

      try {
        // Check existing profile
        const queryProfile = await db.query(
          "SELECT user_id FROM users_linked_accounts WHERE provider_name = $1 AND provider_id = $2;",
          [profile.provider, profile.id],
        );

        // 1) User existing
        if (queryProfile.rows.length > 0) {
          const user = queryProfile.rows[0].user_id;
          done(null, user);
        } else {
          // 2) User not existing
          // extract an array of verified email strings
          const verifiedEmails = profile.emails
            .filter((emailObj) => emailObj.verified === true)
            .map((emailObj) => emailObj.value);

          // A) More than 1 verified emails
          if (verifiedEmails.length > 0) {
            // check if there is verified emails in our storage
            const queryEmail = await db.query(
              "SELECT id, email FROM users WHERE email = ANY($1::text[]);",
              [verifiedEmails],
            );
            // a) no match -> create new user
            if (queryEmail.rows.length === 0) {
              try {
                // create user
                const avatar =
                  profile.photos?.[0]?.value ||
                  "https://i.pravatar.cc/100?u=zz";
                const createUser = await db.query(
                  "INSERT INTO users(name, avatar) VALUES ($1, $2) RETURNING *;",
                  [profile.displayName, avatar],
                );
                const user = createUser.rows[0];

                // create linked account
                try {
                  await db.query(
                    "INSERT INTO users_linked_accounts(user_id, provider_name, provider_id, raw_email) VALUES ($1, $2, $3, $4);",
                    [user.id, profile.provider, profile.id, profile.emails],
                  );

                  done(null, user.id);
                } catch (err) {
                  // clean up
                  await db.query("DELETE FROM users WHERE id = $1;", [user.id]);
                  console.error(err);
                  done(err);
                }
              } catch (err) {
                console.error(err);
                done(err);
              }
            } else if (queryEmail.rows.length === 1) {
              // b) 1 match -> auto link to existing user
              // match user
              const user = queryEmail.rows[0];

              try {
                await db.query(
                  "INSERT INTO users_linked_accounts(user_id, provider_name, provider_id, linked_email, raw_email) VALUES ($1, $2, $3, $4, $5);",
                  [
                    user.id,
                    profile.provider,
                    profile.id,
                    user.email,
                    profile.emails,
                  ],
                );

                done(null, user.id);
              } catch (err) {
                console.error(err);
                done(err);
              }
            } else if (queryEmail.rows.length > 1) {
              // c) more than one match -> prompt user to log in with password
              return done(
                new Error(
                  "Email conflict: multiple existing accounts match. Please log in with your password or contact support.",
                ),
              );
            }
            // B) No verified email -> create new user left email null
          } else if (verifiedEmails.length === 0) {
            // create user
            try {
              const avatar =
                profile.photos?.[0]?.value || "https://i.pravatar.cc/100?u=zz";
              const createUser = await db.query(
                "INSERT INTO users(name, avatar) VALUES ($1, $2) RETURNING *;",
                [profile.displayName, avatar],
              );
              const user = createUser.rows[0];

              // create linked accounts
              try {
                await db.query(
                  "INSERT INTO users_linked_accounts(user_id, provider_name, provider_id, raw_email) VALUES ($1, $2, $3, $4);",
                  [user.id, profile.provider, profile.id, profile.emails],
                );

                done(null, user.id);
              } catch (err) {
                // clean up
                await db.query("DELETE FROM users WHERE id = $1;", [user.id]);
                console.error(err);
                done(err);
              }
            } catch (err) {
              console.error(err);
              done(err);
            }
          }
        }
      } catch (err) {
        console.error(err);
        done(err);
      }
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
