package user

import "time"

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	Icon      string    `json:"icon"`
	CreatedAt time.Time `json:"created_at"`
}
