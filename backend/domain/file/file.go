package file

import (
	"time"
)

type File struct {
	ID                string  `json:"id"`
	UserID            string  `json:"user_id"`
	ParentDirectoryID *string `json:"parent_directory_id"`
	// Embedding         *vector.Vector `json:"embedding"`
	Kind      string    `json:"kind"`
	Url       *string   `json:"url"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PaginationFiles struct {
	Files            []File `json:"files"`
	PageSize         int    `json:"page_size"`
	CurrentPageCount int    `json:"current_page_count"`
	Total            int    `json:"total"`
}
