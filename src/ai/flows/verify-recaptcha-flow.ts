'use server';

/**
 * @fileOverview A server-side flow to verify a reCAPTCHA v2 token.
 *
 * This file exports:
 * - `verifyRecaptcha` - A function that verifies the user's reCAPTCHA response token.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
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
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY is not set in environment variables.');
        return false;
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    try {
      const response = await fetch(verificationUrl, { method: 'POST' });
      const data: any = await response.json();
      
      if (data.success) {
        console.log('reCAPTCHA verification successful. Score:', data.score);
        // For v2, you might just check for success. Score is more relevant for v3.
        return true;
      } else {
        console.warn('reCAPTCHA verification failed:', data['error-codes']);
        return false;
      }
    } catch (error) {
      console.error('Error during reCAPTCHA verification request:', error);
      return false;
    }
  }
);
