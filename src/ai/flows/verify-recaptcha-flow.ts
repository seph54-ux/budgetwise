'use server';

/**
 * @fileOverview A server-side flow to verify a reCAPTCHA Enterprise token.
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
    const apiKey = process.env.RECAPTCHA_API_KEY;
    const siteKey = process.env.RECAPTCHA_SITE_KEY;
    const projectID = process.env.RECAPTCHA_PROJECT_ID;

    if (!apiKey || !siteKey || !projectID) {
      console.error('reCAPTCHA environment variables are not set. Verification cannot proceed.');
      return false;
    }
    if (!token) {
        console.warn('reCAPTCHA verification attempted with no token.');
        return false;
    }

    const verificationUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;

    const requestBody = {
      event: {
        token: token,
        siteKey: siteKey,
        expectedAction: "USER_ACTION"
      }
    };

    try {
      const response = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: any = await response.json();

      // Check for a valid response and a score above the threshold (e.g., 0.5)
      // Adjust score threshold based on your security needs.
      if (data && data.tokenProperties && data.tokenProperties.valid && data.riskAnalysis && data.riskAnalysis.score > 0.5) {
        console.log('reCAPTCHA verification successful. Score:', data.riskAnalysis.score);
        return true;
      } else {
        console.warn('reCAPTCHA verification failed:', data?.tokenProperties?.invalidReason || 'Score too low or invalid token.');
        return false;
      }
    } catch (error) {
      console.error('Error during reCAPTCHA verification request:', error);
      return false;
    }
  }
);
