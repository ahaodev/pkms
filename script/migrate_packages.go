package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"pkms/bootstrap"
	"pkms/ent"
	"pkms/ent/pkg"
	"pkms/ent/release"
)

func main() {
	app := bootstrap.App()

	ctx := context.Background()

	// 获取所有现有的包
	oldPackages, err := app.Database.Pkg.Query().All(ctx)
	if err != nil {
		log.Fatalf("Failed to query old packages: %v", err)
	}

	fmt.Printf("Found %d old packages to migrate\n", len(oldPackages))

	// 创建一个map来存储已创建的新包
	packageMap := make(map[string]string) // key: name+type+project_id, value: new_package_id

	for _, oldPkg := range oldPackages {
		// 生成包的唯一标识
		packageKey := fmt.Sprintf("%s-%s-%s", oldPkg.Name, oldPkg.Type, oldPkg.ProjectID)

		var newPackageID string

		// 检查是否已经创建了对应的新包
		if existingPackageID, exists := packageMap[packageKey]; exists {
			newPackageID = existingPackageID
		} else {
			// 创建新的包记录
			newPackage, err := app.Database.Pkg2.Create().
				SetProjectID(oldPkg.ProjectID).
				SetName(oldPkg.Name).
				SetType(pkg2.Type(oldPkg.Type)).
				SetDescription(oldPkg.Description).
				SetCreatedBy("system"). // 设置为系统迁移
				SetCreatedAt(oldPkg.CreatedAt).
				SetUpdatedAt(oldPkg.UpdatedAt).
				Save(ctx)

			if err != nil {
				log.Printf("Failed to create new package for %s: %v", packageKey, err)
				continue
			}

			newPackageID = newPackage.ID
			packageMap[packageKey] = newPackageID
			fmt.Printf("Created new package: %s (%s)\n", newPackage.Name, newPackage.ID)
		}

		// 创建发布版本记录
		releaseCreate := app.Database.Release.Create().
			SetPackageID(newPackageID).
			SetVersion(oldPkg.Version).
			SetDescription(oldPkg.Changelog).
			SetFilePath(oldPkg.FileURL).
			SetFileName(oldPkg.FileName).
			SetFileSize(oldPkg.FileSize).
			SetFileHash(oldPkg.Checksum).
			SetIsPrerelease(false).
			SetIsLatest(oldPkg.IsLatest).
			SetIsDraft(false).
			SetDownloadCount(oldPkg.DownloadCount).
			SetShareToken(oldPkg.ShareToken).
			SetIsPublic(oldPkg.IsPublic).
			SetCreatedBy("system").
			SetCreatedAt(oldPkg.CreatedAt)

		if !oldPkg.ShareExpiry.IsZero() {
			releaseCreate = releaseCreate.SetShareExpiry(oldPkg.ShareExpiry)
		}

		newRelease, err := releaseCreate.Save(ctx)
		if err != nil {
			log.Printf("Failed to create release for package %s version %s: %v", oldPkg.Name, oldPkg.Version, err)
			continue
		}

		fmt.Printf("Created release: %s v%s (%s)\n", oldPkg.Name, oldPkg.Version, newRelease.ID)
	}

	fmt.Printf("Migration completed successfully!\n")
	fmt.Printf("Created %d unique packages with their releases\n", len(packageMap))
}
