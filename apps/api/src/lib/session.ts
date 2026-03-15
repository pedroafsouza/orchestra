import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';

export async function getSession() {
  return getServerSession(authOptions);
}

// TODO: re-enable auth when ready
const DEV_SKIP_AUTH = true;

let devSession: any = null;

async function getOrCreateDevUser() {
  if (devSession) return devSession;
  const { prisma } = await import('@orchestra/database');
  let user = await prisma.user.findUnique({ where: { email: 'dev@orchestra.local' } });
  if (!user) {
    user = await prisma.user.create({
      data: { name: 'Dev User', email: 'dev@orchestra.local' },
    });
  }
  devSession = {
    user: { id: user.id, name: user.name, email: user.email, image: user.image },
    expires: '2099-01-01T00:00:00.000Z',
  };
  return devSession;
}

export async function requireAuth() {
  if (DEV_SKIP_AUTH) {
    const session = await getOrCreateDevUser();
    return { error: null, session };
  }
  const session = await getSession();
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null };
  }
  return { error: null, session };
}
