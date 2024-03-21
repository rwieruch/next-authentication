'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { lucia } from '@/lib/lucia';
import { getAuth } from '../queries/get-auth';

export const signOut = async (_formData: FormData) => {
  const { session } = await getAuth();

  if (!session) {
    redirect('/sign-in');
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect('/sign-in');
};
