import db from "../db.js";

export async function updateLastLogin(userId) {
  return db.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
    userId,
  ]);
}
