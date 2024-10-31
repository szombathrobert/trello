// actions/move-to-next-list/types.ts

import { z } from "zod";
import { Card } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { MoveToNextList } from "./schema";

export type InputType = z.infer<typeof MoveToNextList>;
export type ReturnType = ActionState<InputType, Card>;
