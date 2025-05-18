package database

import (
	"database/sql"
	"os"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	"github.com/pkg/errors"
	sqlhooks "github.com/qustavo/sqlhooks/v2"
)

func ConnectToDB() (*sqlx.DB, error) {
	dsn := os.Getenv("DATABASE_DSN")
	sql.Register("postgresWithHooks", sqlhooks.Wrap(&pq.Driver{}, &Hooks{}))
	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	return db, nil
}
