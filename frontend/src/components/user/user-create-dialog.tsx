import { UserDialog } from './user-dialog';
import type { UserDialogProps } from './user-dialog';

type UserCreateDialogProps = Omit<UserDialogProps, 'isEdit' | 'title'>;

export const UserCreateDialog = (props: UserCreateDialogProps) => (
  <UserDialog
    {...props}
    title="创建新用户"
    isEdit={false}
  />
);
