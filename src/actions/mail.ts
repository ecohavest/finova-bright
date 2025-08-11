"use server";

import { mailService } from "@/mail";

export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  accountNumber: string
) => {
  await mailService.sendWelcomeEmail(email, firstName, accountNumber);
};
