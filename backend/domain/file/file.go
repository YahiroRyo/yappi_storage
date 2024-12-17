package file

import (
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/domain/vector"
)

type File struct {
	ID                int64          `json:"id"`
	UserID            int64          `json:"user_id"`
	ParentDirectoryID *int64         `json:"parent_directory_id"`
	Embedding         *vector.Vector `json:"embedding"`
	Kind              FileKind       `json:"kind"`
	Url               *string        `json:"url"`
	Name              string         `json:"name"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
}
