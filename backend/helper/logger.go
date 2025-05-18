package helper

import (
	"fmt"
	"os"
	"strings"
	"time"
)

var (
	logger          *os.File
	currentDateTime time.Time
	currentDate     string
)

func init() {
	currentDateTime = time.Now()
	currentDate = currentDateTime.Format("2006-01-02")
}

func getLogger() *os.File {
	now := time.Now()

	if now.Day() != currentDateTime.Day() {
		currentDateTime = now
		currentDate = now.Format("2006-01-02")

		files, err := os.ReadDir("./storage/logs")
		if err != nil {
			return nil
		}

		for _, file := range files {
			date, err := time.Parse("2006-01-02", strings.Split(file.Name(), ".")[0])
			if err != nil {
				continue
			}

			if date.Before(currentDateTime.AddDate(0, 0, -90)) {
				os.Remove(fmt.Sprintf("./storage/logs/%s", file.Name()))
			}
		}

		if logger != nil {
			logger.Close()
		}
	}

	logger, _ = os.OpenFile(fmt.Sprintf("./storage/logs/%s.log", currentDate), os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)

	return logger
}

func Log(message string) {
	logger := getLogger()
	if logger == nil {
		return
	}
	write := fmt.Sprintf("%s\n", message)
	fmt.Println(write)
	logger.WriteString(write)
}

func Logf(message string, args ...interface{}) {
	logger := getLogger()
	if logger == nil {
		return
	}
	write := fmt.Sprintf("%s\n", fmt.Sprintf(message, args...))
	fmt.Println(write)
	logger.WriteString(write)
}

func LogError(message string) {
	logger := getLogger()
	if logger == nil {
		return
	}
	write := fmt.Sprintf("%s\n", message)
	fmt.Println(write)
	logger.WriteString(write)
}
