'use server';

/**
 * @fileOverview A server-side flow to verify a reCAPTCHA Enterprise token by creating an assessment.
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
    const apiKey = process.env.API_KEY; // Use the consolidated API Key
    const siteKey = "6LevOO4rAAAAANqY30BE9I-4kfpVsvUFGc6fe_Ig"; // Your site key
    const projectID = "studio-7875916541-41745"; // Your Project ID

    if (!apiKey) {
      throw new Error('API_KEY is not set in environment variables. Please add it to your .env file.');
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
      },
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

      if (response.ok && data.tokenProperties && data.tokenProperties.valid) {
        // The token is valid. You can check the score for further risk analysis.
        // For a simple checkbox, just checking validity is often enough.
        console.log('reCAPTCHA assessment successful. Score:', data.riskAnalysis.score);
        return true;
      } else {
        // The token is invalid or the request failed.
        const reason = data.tokenProperties?.invalidReason || 'No reason provided';
        console.warn('reCAPTCHA assessment failed:', reason, data);
        return false;
      }
    } catch (error) {
      console.error('Error during reCAPTCHA assessment request:', error);
      return false;
    }
  }
);
