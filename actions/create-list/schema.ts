import { z } from "zod";

export const CreateList = z.object({
    title: z.string({
        required_error: "A cím kötelező!",
        invalid_type_error: "A cím kötelező!"
    }).min(3, {
        message: "A cím túl rövid!"
    }),
    boardId: z.string(),
})