import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import prisma from "./lib/prisma";
import Google from "next-auth/providers/google";
import { Adapter } from "next-auth/adapters";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [Google],
  secret: authSecret,
  trustHost: true,
  callbacks: {
    async session({ session, user }) {
      // Set default role to FARMER if user doesn't have one
      if (user && !user.role) {
        // Update user with FARMER role
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { role: "FARMER" },
        });
        session.user.role = updatedUser.role;
      } else {
        session.user.role = user?.role;
      }
      return session;
    },
  },
});
