package request

type GetFilesRequest struct {
	Query             *string `query:"query" validate:"min_len=1,max_len=512" validate_name:"検索内容"`
	ParentDirectoryId *int64  `query:"parent_directory_id" validate:"id" validate_name:"親フォルダ"`
	PageSize          int     `query:"page_size" validate:"required,min=1,max=50" validate_name:"ページサイズ"`
	CurrentPageCount  int     `query:"current_page_count" validate:"required,max=512" validate_name:"ページあたりの個数"`
}

type RegistrationFileRequest struct {
	ParentDirectoryId *int64 `json:"parent_directory_id" validate:"id" validate_name:"親フォルダ"`
	Url               string `json:"url" validate:"required,url" validate_name:"URL"`
}

type RenameFileRequest struct {
	FileId int64  `json:"file_id" validate:"required,id" validate_name:"ファイルID"`
	Name   string `json:"name" validate:"id,max_len=512" validate_name:"ファイル名"`
}

type MoveFileRequest struct {
	FileId                 int64 `json:"file_id" validate:"required,id" validate_name:"ファイルID"`
	AfterParentDirectoryId int64 `json:"after_parent_directory_id" validate:"id" validate_name:"移動先の親フォルダ"`
}

type DeleteFileRequest struct {
	FileId int64 `json:"file_id" validate:"required,id" validate_name:"ファイルID"`
}
