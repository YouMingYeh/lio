"use server";

import nodemailer from "nodemailer";
import { z } from "zod";

/**
 * Creates and configures a Nodemailer transporter for sending emails.
 * The configuration is derived from the following environment variables:
 * - `SMTP_HOST`
 * - `SMTP_PORT`
 * - `SMTP_SECURE`
 * - `SMTP_USER`
 * - `SMTP_PASS`
 *
 * @see https://nodemailer.com/about/
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email to the "team email" address (defined by `TEAM_EMAIL`) with the provided message.
 *
 * @param {string} message - The textual content of the email.
 * @returns {Promise<{ success: boolean; message: string }>} An object indicating whether
 * the operation was successful and an accompanying message.
 *
 * @example
 * ```ts
 * const result = await sendMailSelf("Hello, team!");
 * if (!result.success) {
 *   console.error("Failed to send email:", result.message);
 * } else {
 *   console.log("Email sent successfully!");
 * }
 * ```
 */
export async function sendMailSelf(
  subject: string,
  message: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Send the email
    await transporter.sendMail({
      from: process.env.TEAM_EMAIL,
      to: process.env.TEAM_EMAIL,
      subject: subject,
      text: message,
    });

    return { success: true, message: "Feedback sent successfully" };
  } catch (error) {
    console.error(
      "Failed to send:",
      error instanceof Error ? error.message : "Unknown error",
    );

    let errorMessage = "An unexpected error occurred. Please try again later.";
    if (error instanceof z.ZodError) {
      errorMessage = "Invalid input. Please check your data and try again.";
    } else if (
      error instanceof Error &&
      error.message.includes("ECONNREFUSED")
    ) {
      errorMessage =
        "Unable to connect to the email server. Please try again later.";
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Sends an email to a specified address with the given subject and text.
 *
 * @param {object} params - The parameters for sending the email.
 * @param {string} params.to - The recipient's email address.
 * @param {string} params.subject - The subject of the email.
 * @param {string} params.text - The body text of the email.
 * @returns {Promise<{ success: boolean; message: string }>} An object indicating
 * whether the email was successfully sent and an accompanying message.
 *
 * @example
 * ```ts
 * const { success, message } = await sendMail({
 *   to: "user@example.com",
 *   subject: "Hello!",
 *   text: "This is a test message",
 * });
 *
 * if (!success) {
 *   console.error("Failed to send email:", message);
 * } else {
 *   console.log("Email sent successfully!");
 * }
 * ```
 */
export async function sendMail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    // Send the email
    await transporter.sendMail({
      from: process.env.TEAM_EMAIL,
      to: to,
      subject: subject,
      text: text,
    });

    return { success: true, message: "Feedback sent successfully" };
  } catch (error) {
    console.error(
      "Failed to send:",
      error instanceof Error ? error.message : "Unknown error",
    );

    let errorMessage = "An unexpected error occurred. Please try again later.";
    if (error instanceof z.ZodError) {
      errorMessage = "Invalid input. Please check your data and try again.";
    } else if (
      error instanceof Error &&
      error.message.includes("ECONNREFUSED")
    ) {
      errorMessage =
        "Unable to connect to the email server. Please try again later.";
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}
