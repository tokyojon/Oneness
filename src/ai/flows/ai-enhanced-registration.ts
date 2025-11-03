'use server';

/**
 * @fileOverview This file defines the AI-enhanced registration flow for the Oneness Kingdom platform.
 *
 * It includes functions and types for user registration with AI-based identity verification.
 *
 * - aiEnhancedRegistration - The main function to initiate the AI-enhanced registration process.
 * - AIEnhancedRegistrationInput - The input type for the aiEnhancedRegistration function.
 * - AIEnhancedRegistrationOutput - The output type for the aiEnhancedRegistration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIEnhancedRegistrationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentDataUri: z
    .string()
    .describe(
      "A photo of a user submitted id document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  age: z.number().describe('The age of the user.'),
});
export type AIEnhancedRegistrationInput = z.infer<typeof AIEnhancedRegistrationInputSchema>;

const AIEnhancedRegistrationOutputSchema = z.object({
  isLegitimate: z.boolean().describe('Whether or not the registration appears legitimate.'),
  reason: z.string().describe('The reason for the determination.'),
  isAdult: z.boolean().describe('Whether the user is an adult (18 years or older).'),
});
export type AIEnhancedRegistrationOutput = z.infer<typeof AIEnhancedRegistrationOutputSchema>;

export async function aiEnhancedRegistration(input: AIEnhancedRegistrationInput): Promise<AIEnhancedRegistrationOutput> {
  return aiEnhancedRegistrationFlow(input);
}

const registrationPrompt = ai.definePrompt({
  name: 'registrationPrompt',
  input: {schema: AIEnhancedRegistrationInputSchema},
  output: {schema: AIEnhancedRegistrationOutputSchema},
  prompt: `You are an AI agent specializing in detecting fraudulent registrations.

You will receive a photo of the user, a photo of the user submitted id document, and the user's provided age. You must determine whether the registration appears legitimate or not based on the information provided. You will also determine whether the user is an adult (18 years or older).

Photo: {{media url=photoDataUri}}
Document: {{media url=documentDataUri}}
Age: {{{age}}}

Consider these things when determining legitimacy:
- Does the person in the photo match the person in the document?
- Does the age provided match the apparent age in the photos?
- Is there any sign of tampering with the images?
- Any other potential indicators of fraud

Output your reasoning in the "reason" field.
Set the isLegitimate field to true if the registration appears legitimate, and false if it does not.
Set the isAdult field to true if the user is 18 years or older, and false if they are younger.`,
});

const aiEnhancedRegistrationFlow = ai.defineFlow(
  {
    name: 'aiEnhancedRegistrationFlow',
    inputSchema: AIEnhancedRegistrationInputSchema,
    outputSchema: AIEnhancedRegistrationOutputSchema,
  },
  async input => {
    const {output} = await registrationPrompt(input);
    return output!;
  }
);
