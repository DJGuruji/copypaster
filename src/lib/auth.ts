import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./db";
import { User } from "./models";
import { verifyTurnstileToken } from "./turnstile";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Verify Turnstile
        const verification = await verifyTurnstileToken(credentials.turnstileToken || '');
        if (!verification.success) {
          throw new Error('Bot detection failed. Please try again.');
        }

        try {
          await connectDB();
          
          // Find user by email and include password for comparison
          const user = await User.findOne({ email: credentials.email }).select("+password");
          
          if (!user) {
            return null;
          }

          // Check if password matches
          const isMatch = await user.matchPassword(credentials.password);
          
          if (!isMatch) {
            return null;
          }

          // Return user without password
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error: any) {
          console.error("Authentication error:", error);
          if (error.message === 'Bot detection failed. Please try again.') {
            throw error;
          }
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-default-secret-do-not-use-in-production",
};

// Extend next-auth types
declare module "next-auth" {
  interface User {
    id: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
} 