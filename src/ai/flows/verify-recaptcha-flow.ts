'use server';

/**
 * @fileOverview A server-side flow to verify a reCAPTCHA v2 token.
 *
 * This file exports:
 * - `verifyRecaptcha` - A function that verifies the user's reCAPTCHA response token.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const VerifyRecaptchaOutputSchema = z.boolean();

export async function verifyRecaptcha(token: string): Promise<boolean> {
  return verifyRecaptchaFlow(token);
}

const verifyRecaptchaFlow = ai.defineFlow(
  {
    name: 'verifyRecaptchaFlow',
    inputSchema: z.string(),
    outputSchema: VerifyRecaptchaOutputSchema,
  },
  async (token) => {
    // This flow now uses the reCAPTCHA v2 verification endpoint.
    // It requires a "secret" key which is different from your site key.
    // Please get your SECRET KEY from the Google Cloud reCAPTCHA admin console
    // and add it to your .env file as RECAPTCHA_SECRET_KEY.
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not set. Verification cannot proceed.');
      // In a production environment, you should fail securely.
      return false;
    }
    if (!token) {
        console.warn('reCAPTCHA verification attempted with no token.');
        return false;
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;

    try {
      const response = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        // The body needs to be in x-www-form-urlencoded format
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      });

      const data: any = await response.json();

      if (data.success) {
        console.log('reCAPTCHA v2 verification successful.');
        return true;
      } else {
        // Log the error codes from Google
        console.warn('reCAPTCHA v2 verification failed:', data['error-codes'] || 'No error codes provided.');
        return false;
      }
    } catch (error) {
      console.error('Error during reCAPTCHA v2 verification request:', error);
      return false;
    }
  }
);
