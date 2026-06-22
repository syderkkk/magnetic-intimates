import type { DefaultSession } from "next-auth";

/**
 * Extiende los tipos de Auth.js para incluir `id` y `role` en la sesión y el
 * token, que poblamos en los callbacks de `src/lib/auth.ts`.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
