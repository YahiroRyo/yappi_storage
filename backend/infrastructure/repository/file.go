package repository

import (
	"errors"
	"fmt"
	"log"
	"math"
	"os"
	"path/filepath"
	"time"

	"github.com/YahiroRyo/yappi_storage/backend/domain/file"
	"github.com/YahiroRyo/yappi_storage/backend/domain/user"
	"github.com/YahiroRyo/yappi_storage/backend/domain/vector"
	"github.com/YahiroRyo/yappi_storage/backend/infrastructure/database"
	"github.com/go-redis/cache/v9"
	yaml "github.com/goccy/go-yaml"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
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
	UploadFileChunk(file []byte, dirname string) (*string, error)
	UpdateFile(tx *sqlx.Tx, user user.User, file file.File) (*file.File, error)
	DeleteFile(tx *sqlx.Tx, user user.User, id string) error
	GetStorageSetting() ([]string, error)
	GetStoreStoragePath() (string, error)
}

type FileRepository struct {
	Redis *redis.Client
	Cache *cache.Cache
}

var storePaths []string

func init() {
	storageConfigFile, err := os.ReadFile("./storage_config.yaml")
	if err != nil {
		log.Fatalf("error reading file: %v", err)
	}
	storageConfig := make(map[string]interface{})
	yaml.Unmarshal(storageConfigFile, &storageConfig)

	for _, mount := range storageConfig["mounts"].([]interface{}) {
		mountMap := mount.(map[string]interface{})

		if mountMap["dirname"] == nil {
			log.Fatalf("dirname is not set")
			break
		}
		if mountMap["path"] == nil {
			log.Fatalf("path is not set")
			break
		}

		dirname := mountMap["dirname"].(string)
		linkPath := mountMap["path"].(string)

		storePaths = append(storePaths, dirname)

		if _, err := os.Stat(fmt.Sprintf("./storage/files/%s", dirname)); os.IsNotExist(err) {
			os.MkdirAll(fmt.Sprintf("./storage/files/%s", dirname), 0755)
		}

		if _, err := os.Stat(linkPath); os.IsNotExist(err) {
			os.Symlink(fmt.Sprintf("./storage/files/%s", dirname), linkPath)
		}
	}
}

func (repo *FileRepository) GetFiles(db *sqlx.DB, user user.User, parentDirectoryId *string, currentPageCount int, pageSize int) (*file.Files, error) {
	var files file.Files

	err := repo.Cache.Once(&cache.Item{
		Key:   fmt.Sprintf("files:%s:%s:%d:%d", user.ID, *parentDirectoryId, currentPageCount, pageSize),
		TTL:   time.Minute,
		Value: &files,
		Do: func(c *cache.Item) (interface{}, error) {
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
		},
	})

	if err != nil {
		return nil, err
	}

	return &files, nil
}

func (repo *FileRepository) GetFileByID(db *sqlx.DB, user user.User, id string) (*file.File, error) {
	args := map[string]interface{}{
		"user_id": user.ID,
		"id":      id,
	}

	var f file.File

	err := repo.Cache.Once(&cache.Item{
		Key:   fmt.Sprintf("file:%s:%s", user.ID, id),
		TTL:   1 * time.Minute,
		Value: &f,
		Do: func(c *cache.Item) (interface{}, error) {
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

			return file.ToEntity(), nil
		},
	})

	if err != nil {
		return nil, errors.Join(FieldSQLError{Code: 500, Message: "エラーが発生しました。"}, err)
	}

	return &f, nil
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

func (repo *FileRepository) UploadFileChunk(file []byte, dirname string) (*string, error) {
	f, err := os.OpenFile(fmt.Sprintf("storage/files/%s", dirname), os.O_CREATE|os.O_RDWR|os.O_APPEND, 0666)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/%s", os.Getenv("BASE_URL"), dirname)

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

func (repo *FileRepository) GetStorageSetting() ([]string, error) {
	return storePaths, nil
}

func (repo *FileRepository) GetStoreStoragePath() (string, error) {
	result := struct {
		Path string
		Size int64
	}{
		Path: "",
		Size: int64(math.MaxInt64),
	}

	for _, storePath := range storePaths {
		var dirSize int64
		err := filepath.Walk(fmt.Sprintf("storage/files/%s", storePath), func(_ string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			if !info.IsDir() {
				dirSize += info.Size()
			}
			return nil
		})
		if err != nil {
			return "", err
		}

		fmt.Println(storePath, dirSize, result.Size)
		if result.Size > dirSize {
			result.Path = storePath
			result.Size = dirSize
		}
	}

	return result.Path, nil
}
