import { verify } from "argon2";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { db } from "@/lib/db";

/**
 * Configuración de Auth.js (v5) para NUE INTIME.
 * Login por credenciales (email + contraseña argon2id), sesión por JWT en cookie
 * HTTP-only. La autorización por rol se valida en el servidor (layout de /admin
 * y Server Actions), nunca confiando en el cliente (CLAUDE.md §7.6).
 */

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// ── Rate limiting de login (CLAUDE.md §7.6: bloqueo tras 5 intentos) ──
// Simple, en memoria del proceso. TODO: mover a almacenamiento compartido
// (Redis) si hay múltiples instancias (CLAUDE.md §11).
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const attempts = new Map<string, { count: number; resetAt: number }>();

function isBlocked(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
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

        // Bloqueo por demasiados intentos: rechaza sin tocar la BD.
        if (isBlocked(email)) return null;

        const user = await db.user.findUnique({
          where: { email },
          include: { role: true },
        });
        if (!user?.passwordHash || !user.isActive) {
          recordFailure(email);
          return null;
        }

        const valid = await verify(user.passwordHash, parsed.data.password);
        if (!valid) {
          recordFailure(email);
          return null;
        }

        attempts.delete(email);
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
