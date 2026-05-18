INSERT INTO users (id, username)
VALUES
    ('0198f6e2-8c00-7000-8000-000000000001', 'alice'),
    ('0198f6e2-8c00-7000-8000-000000000002', 'bob'),
    ('0198f6e2-8c00-7000-8000-000000000003', 'charlie')
ON CONFLICT (id) DO UPDATE
SET username = EXCLUDED.username;
