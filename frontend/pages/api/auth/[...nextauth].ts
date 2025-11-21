import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Call your backend API for login
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );
          const user = response.data.data.user;
          if (user) {
            return user;
          }
          return null;
        } catch (error: any) {
          throw new Error(error.response?.data?.message || "Login failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login", // Error page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || (user as any)._id;
        token.email = user.email ?? undefined;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          role: token.role,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
