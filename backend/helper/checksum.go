package helper

import (
	"hash/crc32"
	"log"
)

// CRC32を使用した高速チェックサム検証
func CalculateChecksum(data []byte, checksum uint32) bool {
	calculated := crc32.ChecksumIEEE(data)

	log.Printf("CRC32 CheckSum validation: calculated=%d, received=%d, match=%t", calculated, checksum, calculated == checksum)

	return calculated == checksum
}

// クライアント側で使用するためのCRC32 CheckSum計算関数
func CalculateChecksumValue(data []byte) uint32 {
	calculated := crc32.ChecksumIEEE(data)

	log.Printf("CRC32 CheckSum calculated: %d for %d bytes", calculated, len(data))

	return calculated
}
