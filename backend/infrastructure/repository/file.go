package repository

import (
	"errors"
	"fmt"
	"os"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/domain/vector"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/database"
	"github.com/jmoiron/sqlx"
)

type FileRepositoryInterface interface {
	GetFiles(db *sqlx.DB, user user.User, parentDirectoryId *string, currentPageCount int, pageSize int) (*file.Files, error)
	GetFileByID(db *sqlx.DB, user user.User, id string) (*file.File, error)
	SearchFiles(
		db *sqlx.DB,
		user user.User,
		embedding vector.Vector,
		currentPageCount int,
		pageSize int,
	) (*file.Files, error)
	RegistrationFile(tx *sqlx.Tx, user user.User, file file.File) (*file.File, error)
	UploadFileChunk(file []byte, filename string) (*string, error)
	UpdateFile(tx *sqlx.Tx, user user.User, file file.File) (*file.File, error)
	DeleteFile(tx *sqlx.Tx, user user.User, id string) error
}

type FileRepository struct {
}

func (repo *FileRepository) GetFiles(db *sqlx.DB, user user.User, parentDirectoryId *string, currentPageCount int, pageSize int) (*file.Files, error) {
	args := map[string]interface{}{
		"user_id":  user.ID,
		"pageSize": pageSize,
		"offset":   pageSize * currentPageCount,
	}

	q := `SELECT * FROM files WHERE user_id = :user_id `

	if *parentDirectoryId == "" {
		q += `AND parent_directory_id IS NULL `
	} else {
		q += `AND parent_directory_id = :parent_directory_id `
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
		if err := rows.StructScan(&f); err != nil {
			return nil, errors.Join(FieldSQLError{Code: 500, Message: "スキャンエラー"}, err)
		}
		e := f.ToEntity()

		files = append(files, e)
	}

	return &files, nil
}

func (repo *FileRepository) GetFileByID(db *sqlx.DB, user user.User, id string) (*file.File, error) {
	args := map[string]interface{}{
		"user_id": user.ID,
		"id":      id,
	}

	rows, err := db.NamedQuery("SELECT * FROM files WHERE user_id = :user_id AND id = :id", args)
	if err != nil {
		return nil, errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err)
	}

	var file database.File
	for rows.Next() {
		if err := rows.StructScan(&file); err != nil {
			return nil, errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err)
		}
	}

	e := file.ToEntity()

	return &e, nil
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
		"offset":    pageSize * (currentPageCount - 1),
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

func (repo *FileRepository) UpdateFile(tx *sqlx.Tx, user user.User, file file.File) (*file.File, error) {
	args := map[string]any{
		"parent_directory_id": file.ParentDirectoryID,
		"embedding":           file.Embedding,
		"kind":                file.Kind,
		"url":                 file.Url,
		"name":                file.Name,
		"id":                  file.ID,
		"user_id":             user.ID,
	}

	_, err := tx.NamedExec(`
		UPDATE files
		SET
			parent_directory_id = :parent_directory_id,
			embedding = :embedding,
			kind = :kind,
			url = :url,
			name = :name
		WHERE
			id = :id
		AND
			user_id = :user_id
		`,
		args,
	)

	if err != nil {
		return nil, errors.Join(FieldSQLError{Message: "エラーが発生しました。", Code: 500}, err)
	}

	return &file, nil
}

func (repo *FileRepository) UploadFileChunk(file []byte, filename string) (*string, error) {
	f, err := os.OpenFile(fmt.Sprintf("storage/files/%s", filename), os.O_CREATE|os.O_RDWR|os.O_APPEND, 0666)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/storage/files/%s", os.Getenv("BASE_URL"), filename)

	defer f.Close()

	if _, err := f.Write(file); err != nil {
		return &url, err
	}

	return &url, nil
}

func (repo *FileRepository) DeleteFile(tx *sqlx.Tx, user user.User, id string) error {
	_, err := tx.Exec(`
		DELETE FROM files
		WHERE
			id = $1
		AND
			user_id = $2
	`, id, user.ID)

	if err != nil {
		return errors.Join(FieldSQLError{Message: "エラーが発生しました。", Code: 500}, err)
	}

	return nil
}
