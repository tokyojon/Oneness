'use server';

/**
 * @fileOverview This file contains the Genkit flow for automated age verification.
 *
 * - automatedAgeVerification - A function that handles the age verification process.
 * - AgeVerificationInput - The input type for the automatedAgeVerification function.
 * - AgeVerificationOutput - The return type for the automatedAgeVerification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgeVerificationInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A government issued document (such as a driver's license or passport) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AgeVerificationInput = z.infer<typeof AgeVerificationInputSchema>;

const AgeVerificationOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether or not the user is verified to be over 18.'),
  age: z.number().optional().describe('The age of the user, if it can be determined.'),
});
export type AgeVerificationOutput = z.infer<typeof AgeVerificationOutputSchema>;

export async function automatedAgeVerification(input: AgeVerificationInput): Promise<AgeVerificationOutput> {
  return automatedAgeVerificationFlow(input);
}

const ageVerificationPrompt = ai.definePrompt({
  name: 'ageVerificationPrompt',
  input: {schema: AgeVerificationInputSchema},
  output: {schema: AgeVerificationOutputSchema},
  prompt: `You are an AI assistant specializing in verifying the age of users based on submitted documentation.

  Analyze the provided document image to determine if the user is over 18 years of age.
  Return 'isVerified: true' if the user is over 18, and 'isVerified: false' otherwise.
  Attempt to determine the user's exact age if possible, and include it in the output. If you cannot determine their age, leave the age field blank.
  Consider various types of documents such as driver's licenses, passports, and other government-issued IDs.
  Be as accurate as possible in your assessment.

  Document: {{media url=documentDataUri}}`,
});

const automatedAgeVerificationFlow = ai.defineFlow(
  {
    name: 'automatedAgeVerificationFlow',
    inputSchema: AgeVerificationInputSchema,
    outputSchema: AgeVerificationOutputSchema,
  },
  async input => {
    const {output} = await ageVerificationPrompt(input);
    return output!;
  }
);
