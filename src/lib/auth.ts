import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "@/src/lib/prisma";
import { logger } from "@/src/lib/logger";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // "Log otp for now"
        logger.info("Auth", `[MOCK EMAIL OTP] Send to ${email}`, { otp, type });
        // In a real app, integrate Resend here:
        // await resend.emails.send({ to: email, subject: "Your OTP", text: `Your code is ${otp}` })
      },
    }),
  ],
});
