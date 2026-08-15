import { verify } from "argon2";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { db } from "@/lib/db";

/**
 * Configuración de Auth.js (v5) para MAGNÉTIC.
 * Login por credenciales (email + contraseña argon2id), sesión por JWT en cookie
 * HTTP-only. La autorización por rol se valida en el servidor (layout de /admin
 * y Server Actions), nunca confiando en el cliente (CLAUDE.md §7.6).
 */

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// ── Rate limiting de login (CLAUDE.md §7.6: bloqueo tras 5 intentos) ──
// Persistido en `login_attempts` (BD), no en memoria del proceso: en Vercel
// serverless cada invocación puede caer en una instancia distinta, así que un
// contador en memoria no bloquea de forma confiable. La tabla ya está en la
// misma Postgres que todo lo demás — sin infraestructura nueva.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

async function isBlocked(email: string): Promise<boolean> {
  const entry = await db.loginAttempt.findUnique({ where: { email } });
  if (!entry) return false;
  if (new Date() > entry.resetAt) {
    await db.loginAttempt.delete({ where: { email } }).catch(() => {});
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

async function recordFailure(email: string): Promise<void> {
  const now = new Date();
  const existing = await db.loginAttempt.findUnique({ where: { email } });
  if (!existing || now > existing.resetAt) {
    await db.loginAttempt.upsert({
      where: { email },
      create: { email, count: 1, resetAt: new Date(now.getTime() + WINDOW_MS) },
      update: { count: 1, resetAt: new Date(now.getTime() + WINDOW_MS) },
    });
  } else {
    await db.loginAttempt.update({
      where: { email },
      data: { count: { increment: 1 } },
    });
  }
}

async function clearFailures(email: string): Promise<void> {
  await db.loginAttempt.delete({ where: { email } }).catch(() => {});
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();

        // Bloqueo por demasiados intentos.
        if (await isBlocked(email)) return null;

        const user = await db.user.findUnique({
          where: { email },
          include: { role: true },
        });
        if (!user?.passwordHash || !user.isActive) {
          await recordFailure(email);
          return null;
        }

        const valid = await verify(user.passwordHash, parsed.data.password);
        if (!valid) {
          await recordFailure(email);
          return null;
        }

        await clearFailures(email);
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role.name,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
