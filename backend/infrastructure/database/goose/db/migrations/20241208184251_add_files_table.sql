-- +goose Up
-- +goose StatementBegin
CREATE TABLE files (
    id BIGINT NOT NULL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    parent_directory_id BIGINT,
    embedding VECTOR(1536),
    kind VARCHAR(255) NOT NULL,
    url VARCHAR(1024),
    name VARCHAR(512) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE files;
-- +goose StatementEnd
