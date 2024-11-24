import * as z from "zod";

export const formSchema = z.object({
    prompt: z.string().min(1, {
        message: "Prompt is required",
    }),
    numQuestions: z.string().regex(/^[1-5]$/, {
        message: "Must be a number between 1 and 5 (included)",
    }),
});