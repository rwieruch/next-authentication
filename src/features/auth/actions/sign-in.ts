'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Argon2id } from 'oslo/password';
import { lucia } from '@/lib/lucia';
import { prisma } from '@/lib/prisma';

const signIn = async (formData: FormData) => {
  const formDataRaw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  try {
    const user = await prisma.user.findUnique({
      where: { email: formDataRaw.email },
    });

    if (!user) {
      // https://www.robinwieruch.de/next-forms/
      throw new Error('Incorrect email or password');
    }

    const validPassword = await new Argon2id().verify(
      user.hashedPassword,
      formDataRaw.password
    );

    if (!validPassword) {
      // https://www.robinwieruch.de/next-forms/
      throw new Error('Incorrect email or password');
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error) {
    // TODO: add error feedback yourself
    // https://www.robinwieruch.de/next-forms/
  }

  redirect('/dashboard');
};

export { signIn };
