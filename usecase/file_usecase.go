package usecase

import (
	"context"
	"io"
	"time"

	"pkms/domain"
)

type fileUsecase struct {
	fileRepository domain.FileRepository
	contextTimeout time.Duration
}

func NewFileUsecase(fileRepository domain.FileRepository, timeout time.Duration) domain.FileUsecase {
	return &fileUsecase{
		fileRepository: fileRepository,
		contextTimeout: timeout,
	}
}

func (fu *fileUsecase) Upload(c context.Context, req *domain.UploadRequest) (*domain.UploadResult, error) {
	ctx, cancel := context.WithTimeout(c, fu.contextTimeout)
	defer cancel()
	return fu.fileRepository.Upload(ctx, req)
}

func (fu *fileUsecase) Download(c context.Context, req *domain.DownloadRequest) (io.ReadCloser, error) {
	ctx, cancel := context.WithTimeout(c, fu.contextTimeout)
	defer cancel()
	return fu.fileRepository.Download(ctx, req)
}

func (fu *fileUsecase) Delete(c context.Context, bucket, objectName string) error {
	ctx, cancel := context.WithTimeout(c, fu.contextTimeout)
	defer cancel()
	return fu.fileRepository.Delete(ctx, bucket, objectName)
}

func (fu *fileUsecase) List(c context.Context, bucket, prefix string) ([]domain.FileInfo, error) {
	ctx, cancel := context.WithTimeout(c, fu.contextTimeout)
	defer cancel()
	return fu.fileRepository.List(ctx, bucket, prefix)
}

func (fu *fileUsecase) GetObjectStat(c context.Context, bucket, objectName string) (*domain.FileInfo, error) {
	ctx, cancel := context.WithTimeout(c, fu.contextTimeout)
	defer cancel()
	return fu.fileRepository.GetObjectStat(ctx, bucket, objectName)
}
