package pkg

import (
	"path"
	"strings"
)

// GetFileType 根据 key 后缀名返回文件类型
func GetFileType(key string) string {
	ext := strings.ToLower(path.Ext(key))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg":
		return "image"
	case ".mp4", ".avi", ".mov", ".mkv":
		return "video"
	case ".mp3", ".wav", ".flac":
		return "audio"
	case ".pdf":
		return "pdf"
	case ".txt", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx":
		return "document"
	case ".zip", ".rar", ".tar", ".gz", ".7z":
		return "archive"
	case ".go", ".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".c", ".cpp", ".rb", ".php":
		return "code"
	case ".apk":
		return "apk"
	case ".exe":
		return "exe"
	default:
		return "other"
	}
}
