package repository

import (
	"errors"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/domain/vector"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/database"
	"github.com/jmoiron/sqlx"
)

type FileRepositoryInterface interface {
	GetFiles(db *sqlx.DB, user user.User, parentDirectoryId *string, currentPageCount int, pageSize int) (*file.Files, error)
	SearchFiles(
		db *sqlx.DB,
		user user.User,
		embedding vector.Vector,
		currentPageCount int,
		pageSize int,
	) (*file.Files, error)
	RegistrationFile(tx *sqlx.Tx, user user.User, file file.File) (*file.File, error)
	UploadFileChunk(file []byte) (bool, error)
}

type FileRepository struct {
}

func (repo *FileRepository) GetFiles(db *sqlx.DB, user user.User, parentDirectoryId *string, currentPageCount int, pageSize int) (*file.Files, error) {
	args := map[string]interface{}{
		"user_id":  user.ID,
		"pageSize": pageSize,
		"offset":   pageSize * currentPageCount,
	}

	q := `SELECT id, user_id, parent_directory_id, embedding, kind, created_at, updated_at FROM files WHERE user_id = :user_id`

	if parentDirectoryId == nil {
		q += `AND parent_directory_id = NULL`
	} else {
		q += `AND parent_directory_id = :parent_directory_id`
		args["parent_directory_id"] = parentDirectoryId
	}

	q += `LIMIT :pageSize OFFSET :offset`

	rows, err := db.NamedQuery(q, args)
	if err != nil {
		return nil, errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err)
	}

	files := make(file.Files, 0)

	for rows.Next() {
		var f database.File
		rows.Scan(&f)
		e := f.ToEntity()

		files = append(files, e)
	}

	return &files, nil
}

func (repo *FileRepository) SearchFiles(
	db *sqlx.DB,
	user user.User,
	embedding vector.Vector,
	currentPageCount int,
	pageSize int,
) (*file.Files, error) {
	args := map[string]interface{}{
		"embedding": embedding,
		"user_id":   user.ID,
		"pageSize":  pageSize,
		"offset":    pageSize * currentPageCount,
	}

	q := `
		SELECT
			id,
			user_id,
			parent_directory_id,
			embedding,
			kind,
			created_at,
			updated_at,
			(embedding <#> :embedding) * -1 AS inner_product
		FROM
			files
		WHERE
			user_id = :user_id
		ORDER BY
			inner_product
		LIMIT
			:pageSize
		OFFSET
			:offset`

	rows, err := db.NamedQuery(q, args)
	if err != nil {
		return nil, errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err)
	}

	files := make(file.Files, 0)

	for rows.Next() {
		var f database.File
		rows.Scan(&f)
		e := f.ToEntity()

		files = append(files, e)
	}

	return &files, nil
}

func (repo *FileRepository) RegistrationFile(tx *sqlx.Tx, user user.User, file file.File) (*file.File, error) {
	_, err := tx.Exec(`
		INSERT INTO files
			(
				id,
				user_id,
				parent_directory_id,
				embedding,
				kind,
				url,
				name,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		file.ID,
		file.UserID,
		file.ParentDirectoryID,
		file.Embedding,
		file.Kind,
		file.Url,
		file.Name,
		file.CreatedAt,
		file.UpdatedAt,
	)
	if err != nil {
		return nil, errors.Join(FieldSQLError{Message: "エラーが発生しました。", Code: 500}, err)
	}

	return &file, nil
}
