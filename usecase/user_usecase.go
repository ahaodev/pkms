package usecase

import (
	"context"
	"pkms/internal/casbin"
	"time"

	"golang.org/x/crypto/bcrypt"
	"pkms/domain"
)

type userUsecase struct {
	userRepository   domain.UserRepository
	tenantRepository domain.TenantRepository
	casbinManager    *casbin.CasbinManager
	contextTimeout   time.Duration
}

func NewUserUsecase(userRepository domain.UserRepository, tenantRepository domain.TenantRepository, casbinManager *casbin.CasbinManager, timeout time.Duration) domain.UserUseCase {
	return &userUsecase{
		userRepository:   userRepository,
		tenantRepository: tenantRepository,
		casbinManager:    casbinManager,
		contextTimeout:   timeout,
	}
}

func (uu *userUsecase) Create(c context.Context, user *domain.User) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()

	// 🔒 加密密码
	if user.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hashedPassword)
	}

	// Create the user first
	if err := uu.userRepository.Create(ctx, user); err != nil {
		return err
	}

	// Auto-create a default tenant with the same name as the user
	tenant := &domain.Tenant{
		Name: user.Name,
	}

	if err := uu.tenantRepository.Create(ctx, tenant); err != nil {
		// If tenant creation fails, we should log it but not fail the user creation
		// since the user has already been created
		// In a production system, you might want to use a transaction here
		return err
	}

	// Add the user to the newly created tenant with PM permissions
	if err := uu.tenantRepository.AddUserToTenant(ctx, user.ID, tenant.ID); err != nil {
		return err
	}
	uu.casbinManager.AddPolicy(domain.TenantRoleOwner, tenant.ID, "*", "*")
	uu.casbinManager.AddRoleForUser(user.ID, domain.TenantRoleOwner, tenant.ID)
	return nil
}

func (uu *userUsecase) Fetch(c context.Context) ([]domain.User, error) {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()
	return uu.userRepository.Fetch(ctx)
}

func (uu *userUsecase) GetByUserName(c context.Context, userName string) (domain.User, error) {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()
	return uu.userRepository.GetByUserName(ctx, userName)
}

func (uu *userUsecase) GetByID(c context.Context, id string) (domain.User, error) {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()
	return uu.userRepository.GetByID(ctx, id)
}

func (uu *userUsecase) Update(c context.Context, user *domain.User) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()

	// 🔒 如果有新密码，需要加密
	if user.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hashedPassword)
	}

	return uu.userRepository.Update(ctx, user)
}

func (uu *userUsecase) Delete(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()
	return uu.userRepository.Delete(ctx, id)
}

func (uu *userUsecase) UpdateProfile(c context.Context, userID string, updates domain.ProfileUpdate) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()

	// Get existing user
	user, err := uu.userRepository.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	// Update the user with new data
	if updates.Name != "" {
		user.Name = updates.Name
	}
	// Note: Avatar field is not in the current User struct, but can be added later

	return uu.userRepository.Update(ctx, &user)
}

func (uu *userUsecase) UpdatePassword(c context.Context, userID string, passwordUpdate domain.PasswordUpdate) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()

	// Get existing user
	user, err := uu.userRepository.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(passwordUpdate.CurrentPassword)); err != nil {
		return domain.ErrInvalidPassword
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(passwordUpdate.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Update password
	user.Password = string(hashedPassword)
	return uu.userRepository.Update(ctx, &user)
}

func (uu *userUsecase) UpdatePartial(c context.Context, userID string, updates domain.UserUpdateRequest) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()

	// Get existing user
	user, err := uu.userRepository.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	// Apply partial updates
	if updates.Name != nil {
		user.Name = *updates.Name
	}
	if updates.IsActive != nil {
		user.IsActive = *updates.IsActive
	}
	if updates.Password != nil && *updates.Password != "" {
		// 🔒 加密密码
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*updates.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hashedPassword)
	}

	return uu.userRepository.Update(ctx, &user)
}
