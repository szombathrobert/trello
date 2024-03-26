import { z } from "zod";

export const CreateBoard = z.object({
    title: z.string({
        required_error: "A cím kötelező!",
        invalid_type_error: "A cím kötelező!",
    }).min(3, {
        message: "A cím túl rövid!"
    }),
    image: z.string({
        required_error: "Kötelező képet választani!",
        invalid_type_error: "Kötelező képet választani!"
    })
});