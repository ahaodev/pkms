package usecase

import (
	"context"
	"time"

	"pkms/domain"
)

type userUsecase struct {
	userRepository   domain.UserRepository
	tenantRepository domain.TenantRepository
	contextTimeout   time.Duration
}

func NewUserUsecase(userRepository domain.UserRepository, tenantRepository domain.TenantRepository, timeout time.Duration) domain.UserUseCase {
	return &userUsecase{
		userRepository:   userRepository,
		tenantRepository: tenantRepository,
		contextTimeout:   timeout,
	}
}

func (uu *userUsecase) Create(c context.Context, user *domain.User) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()
	
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
	return uu.userRepository.Update(ctx, user)
}

func (uu *userUsecase) Delete(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()
	return uu.userRepository.Delete(ctx, id)
}

func (uu *userUsecase) GetUserProjects(c context.Context, userID string) ([]domain.Project, error) {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()
	return uu.userRepository.GetUserProjects(ctx, userID)
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

func (uu *userUsecase) AssignUserToProject(c context.Context, userID, projectID string) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()

	// This would typically involve creating a relationship in a join table
	// For now, we'll just validate that both user and project exist
	_, err := uu.userRepository.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	// TODO: Add project existence check and create relationship
	// This requires access to the project repository or a many-to-many table

	return nil
}

func (uu *userUsecase) UnassignUserFromProject(c context.Context, userID, projectID string) error {
	ctx, cancel := context.WithTimeout(c, uu.contextTimeout)
	defer cancel()

	// This would typically involve removing a relationship from a join table
	// For now, we'll just validate that both user and project exist
	_, err := uu.userRepository.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	// TODO: Add project existence check and remove relationship
	// This requires access to the project repository or a many-to-many table

	return nil
}
