import * as z from "zod";

export const formSchema = z.object({
    jobDescription: z.string().default(""),
    jobTitle: z.string().min(1, {
        message: "Job title is required",
    }),
});