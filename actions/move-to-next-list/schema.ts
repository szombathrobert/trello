// actions/move-to-next-list/schema.ts

import { z } from "zod";

export const MoveToNextList = z.object({
  id: z.string(),
  boardId: z.string(),
});
