import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const isSuperAdmin = (user) => {
  return user?.user_metadata?.is_super_admin === true;
};

export function getUserRole(session) {
  return session?.user?.user_metadata?.userRole || ROLES.USER;
}

export function isAdmin(session) {
  return getUserRole(session) === ROLES.ADMIN || session?.user?.user_metadata?.is_super_admin === true;
}

export async function setUserRole(userId, role) {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase.auth.updateUser({
    data: { userRole: role }
  });

  if (error) {
    console.error('Error setting user role:', error);
    throw error;
  }

  return true;
}
