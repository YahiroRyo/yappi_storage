package file

import (
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/domain/vector"
)

type File struct {
	ID                string         `json:"id"`
	UserID            string         `json:"user_id"`
	ParentDirectoryID *string        `json:"parent_directory_id"`
	Embedding         *vector.Vector `json:"embedding"`
	Kind              FileKind       `json:"kind"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
}
