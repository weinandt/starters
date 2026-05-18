CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuidv7(),
    username text NOT NULL,
    CONSTRAINT users_username_not_blank CHECK (btrim(username) <> '')
);
