import db from "../db.js";

const AVATAR_FALLBACK = "https://i.pravatar.cc/100?u=zz";

export async function updateLastLogin(userId) {
  return db.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
    userId,
  ]);
}

export async function checkLinkedAccount(provider, id) {
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

export async function checkExistingEmail(emailArr) {
  const result = await db.query(
    "SELECT id, email FROM users WHERE email = ANY($1::text[]);",
    [emailArr],
  );

  return result.rows;
}

export async function createUserWithoutEmail(profileData) {
  const avatar = profileData.photos?.[0]?.value || AVATAR_FALLBACK;

  // create user
  const result = await db.query(
    "INSERT INTO users(name, avatar) VALUES ($1, $2) RETURNING *;",
    [profileData.displayName, avatar],
  );
  const user = result.rows[0];

  // create linked account
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

export async function linkUserByEmail(userData, profileData) {
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
