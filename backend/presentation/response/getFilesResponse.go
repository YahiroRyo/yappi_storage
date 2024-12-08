package response

import "github.com/YahiroRyo/yappi_storage/backend/domain/file"

type GetFilesResponse struct {
	PageSize         int        `json:"page_size"`
	CurrentPageCount int        `json:"current_page_count"`
	Files            file.Files `json:"files"`
}
