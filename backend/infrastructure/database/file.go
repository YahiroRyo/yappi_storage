package database

import (
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/vector"
)

type File struct {
	ID                string    `db:"id"`
	UserID            string    `db:"user_id"`
	ParentDirectoryID *string   `db:"parent_directory_id"`
	Embedding         *Vector   `db:"embedding"`
	Kind              string    `db:"kind"`
	Url               *string   `db:"url"`
	Name              string    `db:"name"`
	CreatedAt         time.Time `db:"created_at"`
	UpdatedAt         time.Time `db:"updated_at"`
}

func (f *File) ToEntity() file.File {
	return file.File{
		ID:                f.ID,
		UserID:            f.UserID,
		ParentDirectoryID: f.ParentDirectoryID,
		Embedding:         (*vector.Vector)(f.Embedding),
		Kind:              f.Kind,
		Name:              f.Name,
		Url:               f.Url,
		CreatedAt:         f.CreatedAt,
		UpdatedAt:         f.UpdatedAt,
	}
}
