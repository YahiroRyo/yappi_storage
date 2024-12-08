package request

type GetFilesRequest struct {
	Query             *string `json:"query" validate:"required,min_len=1,max_len=512" validate_name:"検索内容"`
	ParentDirectoryId *string `json:"parent_directory_id" validate:"id" validate_name:"親フォルダ"`
	PageSize          int     `json:"page_size" validate:"required,min=1,max=50" validate_name:"ページサイズ"`
	CurrentPageCount  int     `json:"current_page_count" validate:"required,max=512" validate_name:"ページあたりの個数"`
}
