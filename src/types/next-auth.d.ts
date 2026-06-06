import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "COACH" | "CLIENT";
      coachId?: string | null;
      studentId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "ADMIN" | "COACH" | "CLIENT";
    coachId?: string | null;
    studentId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "COACH" | "CLIENT";
    coachId?: string | null;
    studentId?: string | null;
  }
}
