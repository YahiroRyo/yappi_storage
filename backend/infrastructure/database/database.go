package database

import (
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func ConnectToDB() (*sqlx.DB, error) {
	dsn := os.Getenv("DATABASE_DSN")
	return sqlx.Open("postgres", dsn)
}
