package pkg

import (
	"math/rand"
	"time"
)

const charset = "abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

// GenerateShareCode generates a 5-digit random code
func GenerateShareCode(length int) string {
	result := make([]byte, length)
	seed := rand.NewSource(time.Now().UnixNano())
	r := rand.New(seed)

	for i := range result {
		result[i] = charset[r.Intn(len(charset))]
	}

	return string(result)
}
func GenerateAccessToken() string {
	return "PKMS-" + GenerateShareCode(16)
}
