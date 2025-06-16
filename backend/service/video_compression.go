package service

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type VideoCompressionService interface {
	CompressVideo(inputPath, outputPath string) error
	IsVideoFile(filename string) bool
	GetCompressedFilename(originalFilename string) string
}

type videoCompressionService struct{}

func NewVideoCompressionService() VideoCompressionService {
	return &videoCompressionService{}
}

// IsVideoFile checks if the file is a video file based on its extension
func (vcs *videoCompressionService) IsVideoFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	videoExtensions := []string{".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv", ".m4v", ".3gp", ".mts", ".m2ts"}

	for _, videoExt := range videoExtensions {
		if ext == videoExt {
			return true
		}
	}
	return false
}

// GetCompressedFilename generates a filename for the compressed video
func (vcs *videoCompressionService) GetCompressedFilename(originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	nameWithoutExt := strings.TrimSuffix(originalFilename, ext)
	return fmt.Sprintf("%s_compressed.mp4", nameWithoutExt)
}

// CompressVideo compresses a video file using ffmpeg
func (vcs *videoCompressionService) CompressVideo(inputPath, outputPath string) error {
	log.Printf("Starting video compression: %s -> %s", inputPath, outputPath)

	// Check if input file exists
	if _, err := os.Stat(inputPath); os.IsNotExist(err) {
		return fmt.Errorf("input file does not exist: %s", inputPath)
	}

	// Create context with timeout to prevent hanging
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
	defer cancel()

	// Build ffmpeg command for compression
	// -i: input file
	// -c:v libx264: use H.264 video codec
	// -crf 23: quality setting (18-28 is usually good, 23 is default)
	// -preset medium: compression speed/efficiency balance
	// -c:a aac: use AAC audio codec
	// -b:a 128k: audio bitrate
	// -movflags +faststart: optimize for web streaming
	cmd := exec.CommandContext(ctx,
		"ffmpeg",
		"-i", inputPath, // Input file
		"-c:v", "libx264", // Video codec
		"-crf", "23", // Quality setting
		"-preset", "medium", // Compression preset
		"-c:a", "aac", // Audio codec
		"-b:a", "128k", // Audio bitrate
		"-movflags", "+faststart", // Web optimization
		"-y",       // Overwrite output file if exists
		outputPath, // Output file
	)

	// Log the command being executed
	log.Printf("Executing ffmpeg command: %s", cmd.String())

	// Capture output for debugging
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("FFmpeg error: %v", err)
		log.Printf("FFmpeg output: %s", string(output))
		return fmt.Errorf("video compression failed: %v", err)
	}

	log.Printf("Video compression completed successfully: %s", outputPath)

	// Verify the output file was created
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		return fmt.Errorf("compressed file was not created: %s", outputPath)
	}

	// Log file sizes for comparison
	inputInfo, _ := os.Stat(inputPath)
	outputInfo, _ := os.Stat(outputPath)

	if inputInfo != nil && outputInfo != nil {
		compressionRatio := float64(outputInfo.Size()) / float64(inputInfo.Size()) * 100
		log.Printf("Compression completed - Original: %d bytes, Compressed: %d bytes (%.1f%%)",
			inputInfo.Size(), outputInfo.Size(), compressionRatio)
	}

	return nil
}

// CompressVideoAsync compresses video in background and calls callback when done
func (vcs *videoCompressionService) CompressVideoAsync(inputPath, outputPath string, onComplete func(error)) {
	go func() {
		err := vcs.CompressVideo(inputPath, outputPath)
		if onComplete != nil {
			onComplete(err)
		}
	}()
}
