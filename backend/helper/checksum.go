package helper

import (
	"log"
)

const (
	ChecksumModulus = 1052
)

func CalculateChecksum(data []byte, checksum uint64) bool {
	var result uint64

	for i := 0; i < len(data); i++ {
		result += uint64(data[i])
	}

	result %= ChecksumModulus

	log.Printf("CheckSum validation: calculated=%d, received=%d, match=%t", result, checksum, result == checksum)

	return result == checksum
}

// クライアント側で使用するためのCheckSum計算関数
func CalculateChecksumValue(data []byte) uint64 {
	var result uint64

	for i := 0; i < len(data); i++ {
		result += uint64(data[i])
	}

	result %= ChecksumModulus

	log.Printf("CheckSum calculated: %d for %d bytes", result, len(data))

	return result
}
