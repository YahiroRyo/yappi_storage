package file

import (
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/domain/vector"
)

type File struct {
	ID                string
	UserID            string
	ParentDirectoryID *string
	Embedding         *vector.Vector
	Kind              FileKind
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
