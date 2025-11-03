'use server';

/**
 * @fileOverview A Genkit flow for generating a welcome email.
 * 
 * - generateWelcomeEmail - A function that creates a personalized welcome email.
 * - WelcomeEmailInput - The input type for the generateWelcomeEmail function.
 * - WelcomeEmailOutput - The return type for the generateWelcomeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WelcomeEmailInputSchema = z.object({
  name: z.string().describe('The name of the new user.'),
});
export type WelcomeEmailInput = z.infer<typeof WelcomeEmailInputSchema>;

const WelcomeEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The body of the email.'),
});
export type WelcomeEmailOutput = z.infer<typeof WelcomeEmailOutputSchema>;

export async function generateWelcomeEmail(input: WelcomeEmailInput): Promise<WelcomeEmailOutput> {
    return welcomeEmailFlow(input);
}

const welcomeEmailPrompt = ai.definePrompt({
    name: 'welcomeEmailPrompt',
    input: { schema: WelcomeEmailInputSchema },
    output: { schema: WelcomeEmailOutputSchema },
    prompt: `You are an AI assistant for Oneness Kingdom, a social platform based on love, peace, and harmony.
    
    Your task is to generate a warm and welcoming email to a new user.
    The user's name is {{{name}}}.
    
    The email subject should be welcoming.
    The email body should:
    1.  Welcome the user by name to Oneness Kingdom.
    2.  Briefly mention the platform's values (love, peace, harmony, contribution).
    3.  Encourage them to start exploring and connecting with others.
    4.  End with a warm closing.
    
    Keep the tone friendly, inspiring, and positive. The language should be Japanese.`
});


const welcomeEmailFlow = ai.defineFlow(
    {
        name: 'welcomeEmailFlow',
        inputSchema: WelcomeEmailInputSchema,
        outputSchema: WelcomeEmailOutputSchema,
    },
    async (input) => {
        const { output } = await welcomeEmailPrompt(input);
        
        // In a real application, you would integrate with an email sending service here.
        console.log('--- Sending Welcome Email ---');
        console.log(`To: New User`);
        console.log(`Subject: ${output!.subject}`);
        console.log(`Body: ${output!.body}`);
        console.log('---------------------------');
        
        return output!;
    }
);
