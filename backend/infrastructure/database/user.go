package database

import (
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
)

type User struct {
	ID        int64     `db:"id"`
	Email     string    `db:"email"`
	Password  string    `db:"password"`
	SessionID *string   `db:"session_id"`
	Icon      string    `db:"icon"`
	CreatedAt time.Time `db:"created_at"`
}

func (u *User) ToEntity() user.User {
	return user.User{
		ID:        u.ID,
		Email:     u.Email,
		Password:  u.Password,
		Icon:      u.Icon,
		CreatedAt: u.CreatedAt,
	}
}
