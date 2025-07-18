table "groups" {
  schema = schema.main
  column "id" {
    null = false
    type = text
  }
  column "name" {
    null = false
    type = text
  }
  column "description" {
    null = true
    type = text
  }
  column "color" {
    null = true
    type = text
  }
  column "created_at" {
    null = false
    type = datetime
  }
  column "updated_at" {
    null = false
    type = datetime
  }
  column "member_count" {
    null    = false
    type    = integer
    default = 0
  }
  column "created_by" {
    null = false
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "groups_users_created_groups" {
    columns     = [column.created_by]
    ref_columns = [table.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "group_created_by" {
    columns = [column.created_by]
  }
}
table "group_memberships" {
  schema = schema.main
  column "id" {
    null = false
    type = text
  }
  column "joined_at" {
    null = false
    type = datetime
  }
  column "group_id" {
    null = false
    type = text
  }
  column "user_id" {
    null = false
    type = text
  }
  column "added_by" {
    null = false
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "group_memberships_users_added_group_memberships" {
    columns     = [column.added_by]
    ref_columns = [table.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "group_memberships_users_group_memberships" {
    columns     = [column.user_id]
    ref_columns = [table.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "group_memberships_groups_memberships" {
    columns     = [column.group_id]
    ref_columns = [table.groups.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "groupmembership_user_id" {
    columns = [column.user_id]
  }
  index "groupmembership_group_id" {
    columns = [column.group_id]
  }
  index "groupmembership_user_id_group_id" {
    unique  = true
    columns = [column.user_id, column.group_id]
  }
}
table "group_permissions" {
  schema = schema.main
  column "id" {
    null = false
    type = text
  }
  column "can_view" {
    null    = false
    type    = bool
    default = false
  }
  column "can_edit" {
    null    = false
    type    = bool
    default = false
  }
  column "group_id" {
    null = false
    type = text
  }
  column "project_id" {
    null = false
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "group_permissions_projects_group_permissions" {
    columns     = [column.project_id]
    ref_columns = [table.projects.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "group_permissions_groups_permissions" {
    columns     = [column.group_id]
    ref_columns = [table.groups.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "grouppermission_group_id" {
    columns = [column.group_id]
  }
  index "grouppermission_project_id" {
    columns = [column.project_id]
  }
  index "grouppermission_group_id_project_id" {
    unique  = true
    columns = [column.group_id, column.project_id]
  }
}
table "pkgs" {
  schema = schema.main
  column "id" {
    null = false
    type = text
  }
  column "name" {
    null = false
    type = text
  }
  column "description" {
    null = true
    type = text
  }
  column "type" {
    null = false
    type = text
  }
  column "version" {
    null = false
    type = text
  }
  column "file_url" {
    null = false
    type = text
  }
  column "file_name" {
    null = false
    type = text
  }
  column "file_size" {
    null = false
    type = integer
  }
  column "checksum" {
    null = false
    type = text
  }
  column "changelog" {
    null = true
    type = text
  }
  column "is_latest" {
    null    = false
    type    = bool
    default = false
  }
  column "download_count" {
    null    = false
    type    = integer
    default = 0
  }
  column "created_at" {
    null = false
    type = datetime
  }
  column "updated_at" {
    null = false
    type = datetime
  }
  column "version_code" {
    null = false
    type = integer
  }
  column "min_sdk_version" {
    null = true
    type = integer
  }
  column "target_sdk_version" {
    null = true
    type = integer
  }
  column "share_token" {
    null = false
    type = text
  }
  column "share_expiry" {
    null = true
    type = datetime
  }
  column "is_public" {
    null    = false
    type    = bool
    default = false
  }
  column "project_id" {
    null = false
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "pkgs_projects_packages" {
    columns     = [column.project_id]
    ref_columns = [table.projects.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "pkgs_share_token_key" {
    unique  = true
    columns = [column.share_token]
  }
  index "pkg_project_id" {
    columns = [column.project_id]
  }
  index "pkg_type" {
    columns = [column.type]
  }
  index "pkg_is_latest" {
    columns = [column.is_latest]
  }
  index "pkg_share_token" {
    columns = [column.share_token]
  }
  index "pkg_created_at" {
    columns = [column.created_at]
  }
}
table "projects" {
  schema = schema.main
  column "id" {
    null = false
    type = text
  }
  column "name" {
    null = false
    type = text
  }
  column "description" {
    null = true
    type = text
  }
  column "icon" {
    null = true
    type = text
  }
  column "created_at" {
    null = false
    type = datetime
  }
  column "updated_at" {
    null = false
    type = datetime
  }
  column "package_count" {
    null    = false
    type    = integer
    default = 0
  }
  column "is_public" {
    null    = false
    type    = bool
    default = false
  }
  column "created_by" {
    null = false
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "projects_users_created_projects" {
    columns     = [column.created_by]
    ref_columns = [table.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "project_created_by" {
    columns = [column.created_by]
  }
  index "project_is_public" {
    columns = [column.is_public]
  }
}
table "project_permissions" {
  schema = schema.main
  column "id" {
    null = false
    type = text
  }
  column "can_view" {
    null    = false
    type    = bool
    default = false
  }
  column "can_edit" {
    null    = false
    type    = bool
    default = false
  }
  column "project_id" {
    null = false
    type = text
  }
  column "user_id" {
    null = false
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "project_permissions_users_project_permissions" {
    columns     = [column.user_id]
    ref_columns = [table.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "project_permissions_projects_user_permissions" {
    columns     = [column.project_id]
    ref_columns = [table.projects.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "projectpermission_user_id" {
    columns = [column.user_id]
  }
  index "projectpermission_project_id" {
    columns = [column.project_id]
  }
  index "projectpermission_user_id_project_id" {
    unique  = true
    columns = [column.user_id, column.project_id]
  }
}
table "user_project_assignments" {
  schema = schema.main
  column "id" {
    null = false
    type = text
  }
  column "assigned_at" {
    null = false
    type = datetime
  }
  column "project_id" {
    null = false
    type = text
  }
  column "user_id" {
    null = false
    type = text
  }
  column "assigned_by" {
    null = false
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "user_project_assignments_users_assigned_project_assignments" {
    columns     = [column.assigned_by]
    ref_columns = [table.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "user_project_assignments_users_project_assignments" {
    columns     = [column.user_id]
    ref_columns = [table.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "user_project_assignments_projects_user_assignments" {
    columns     = [column.project_id]
    ref_columns = [table.projects.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "userprojectassignment_user_id" {
    columns = [column.user_id]
  }
  index "userprojectassignment_project_id" {
    columns = [column.project_id]
  }
  index "userprojectassignment_user_id_project_id" {
    unique  = true
    columns = [column.user_id, column.project_id]
  }
}
table "users" {
  schema = schema.main
  column "id" {
    null = false
    type = text
  }
  column "username" {
    null = false
    type = text
  }
  column "password_hash" {
    null = false
    type = text
  }
  column "avatar" {
    null = true
    type = text
  }
  column "role" {
    null = false
    type = text
  }
  column "created_at" {
    null = false
    type = datetime
  }
  column "updated_at" {
    null = false
    type = datetime
  }
  column "is_active" {
    null    = false
    type    = bool
    default = true
  }
  primary_key {
    columns = [column.id]
  }
  index "users_username_key" {
    unique  = true
    columns = [column.username]
  }
  index "user_username" {
    columns = [column.username]
  }
  index "user_role" {
    columns = [column.role]
  }
  index "user_is_active" {
    columns = [column.is_active]
  }
}
schema "main" {
}
