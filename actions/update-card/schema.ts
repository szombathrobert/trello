import { z } from "zod";

export const UpdateCard = z.object({
    boardId: z.string(),
    description: z.optional(
        z.string({
            required_error: "A leírás mező kötelező!",
            invalid_type_error: "A leírás mező kötelező!",
        }).min(3, {
            message: "A leírás mező túl rövid.",
        }),
    ),
    title: z.string({
        required_error: "A cím kötelező!",
        invalid_type_error: "A cím kötelező!"
    }).min(3, {
        message: "A cím túl rövid!"
    }),
    id: z.string(),
})