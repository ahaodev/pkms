package s3

import (
	"fmt"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"pkms/bootstrap"
)

func Connect(env *bootstrap.Env) (error, *minio.Client) {
	// 初始化 MinIO 客户端
	minioClient, err := minio.New(env.S3Address, &minio.Options{
		Creds:  credentials.NewStaticV4(env.S3AccessKey, env.S3SecretKey, env.S3Token),
		Secure: false,
	})
	if err != nil {
		return err, nil
	}
	if minioClient.IsOffline() {
		return fmt.Errorf("minio不在线%v", minioClient), nil
	}
	return nil, minioClient
}
