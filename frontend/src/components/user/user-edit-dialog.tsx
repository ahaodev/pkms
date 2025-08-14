import { UserDialog } from './user-dialog';
import type { UserDialogProps } from './user-dialog';
import { useI18n } from '@/contexts/i18n-context';

type UserEditDialogProps = Omit<UserDialogProps, 'isEdit' | 'title'>;

export const UserEditDialog = (props: UserEditDialogProps) => {
  const { t } = useI18n();
  
  return (
    <UserDialog
      {...props}
      title={t('user.edit')}
      isEdit={true}
    />
  );
};
