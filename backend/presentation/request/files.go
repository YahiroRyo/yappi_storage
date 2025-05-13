package request

type GetFilesRequest struct {
	Query             *string `query:"query" validate:"min_len=1,max_len=512" validate_name:"検索内容"`
	ParentDirectoryId *string `query:"parent_directory_id"`
	PageSize          int     `query:"page_size" validate:"required,min=1,max=50" validate_name:"ページサイズ"`
	CurrentPageCount  int     `query:"current_page_count" validate:"required,max=512" validate_name:"ページあたりの個数"`
}

type GetFileRequest struct {
	FileId string `params:"file_id"`
}

type RegistrationDirectoryRequest struct {
	Name              string  `json:"name" validate:"required,max_len=128" validate_name:"ディレクトリ名"`
	ParentDirectoryId *string `json:"parent_directory_id"`
}

type RegistrationFilesRequest struct {
	RegistrationFiles []struct {
		ParentDirectoryId *string `json:"parent_directory_id"`
		Name              string  `json:"name" validate:"required,max_len=128" validate_name:"ファイル名"`
		Kind              string  `json:"kind" validate:"required" validate_name:"ファイル種類"`
		Url               string  `json:"url" validate:"required,url" validate_name:"URL"`
	} `json:"registration_files" validate:"required" validate_name:"ファイル登録リスト"`
}

type RenameFileRequest struct {
	FileId string `json:"file_id" validate:"required" validate_name:"ファイルID"`
	Name   string `json:"name" validate:"max_len=512" validate_name:"ファイル名"`
}

type MoveFilesRequest struct {
	FileIds                []string `json:"file_ids" validate:"required" validate_name:"ファイルID"`
	AfterParentDirectoryId string   `json:"after_parent_directory_id"`
}

type DeleteFilesRequest struct {
	FileIds []string `json:"file_ids" validate:"required" validate_name:"ファイルID"`
}
