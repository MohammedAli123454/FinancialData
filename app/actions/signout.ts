'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'auth_token';

export async function signoutAction() {
  const store = await cookies();
  store.set(COOKIE_NAME, '', { maxAge: 0 });
  redirect('/');
}

