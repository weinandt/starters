/* @name user.getUser */
SELECT username
FROM users
WHERE id = $1::uuid;

/* @name user.createUser */
INSERT INTO users (username)
VALUES ($1)
RETURNING id::text AS id, username;
