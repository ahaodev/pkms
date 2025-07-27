import { UserDialog } from './user-dialog';
import type { UserDialogProps } from './user-dialog';

type UserEditDialogProps = Omit<UserDialogProps, 'isEdit' | 'title'>;

export const UserEditDialog = (props: UserEditDialogProps) => (
  <UserDialog
    {...props}
    title="编辑用户"
    isEdit={true}
  />
);
