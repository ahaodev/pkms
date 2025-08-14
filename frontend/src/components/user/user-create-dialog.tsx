import { UserDialog } from './user-dialog';
import type { UserDialogProps } from './user-dialog';
import { useI18n } from '@/contexts/i18n-context';

type UserCreateDialogProps = Omit<UserDialogProps, 'isEdit' | 'title'>;

export const UserCreateDialog = (props: UserCreateDialogProps) => {
  const { t } = useI18n();
  return (
    <UserDialog
      {...props}
      title={t('user.createNew')}
      isEdit={false}
    />
  );
};
