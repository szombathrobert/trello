"use server"

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CopyList } from "./schema";
import { InputType, ReturnType } from "./types"

const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();
  
    if (!userId || !orgId) {
      return {
        error: "Nincs azonosítva!",
      };
    }

    const { id, boardId } = data;
    let list: { cards: { id: string; title: string; order: number; description: string | null; listId: string; createdAt: Date; updatedAt: Date; }[]; } & { id: string; title: string; order: number; boardId: string; createdAt: Date; updatedAt: Date; };
  
    try {
      const listToCopy = await db.list.findUnique({
        where: {
          id,
          boardId,
          board: {
            orgId,
          },
        },
        include: {
          cards: true,
        },
      });
  
      if (!listToCopy) {
        return { error: "Lista nem található!" };
      }
  
      const lastList = await db.list.findFirst({
        where: { boardId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
  
      const newOrder = lastList ? lastList.order + 1 : 1;
  
      list = await db.list.create({
        data: {
            boardId: listToCopy.boardId,
            title: `${listToCopy.title} - Másolata`,
            order: newOrder,
        },
        include: {
            cards: true,
        },
    });

    if (listToCopy.cards.length > 0) {
      await db.card.createMany({
          data: listToCopy.cards.map((card) => ({
              title: card.title,
              description: card.description,
              order: card.order,
              listId: list.id,
          })),
      });
  }
    } catch (error) {
        return {
          error: "Sikertelen másolás."
        }
      }
    
    revalidatePath(`/board/${boardId}`);
    return { data: list };
  };
    
export const copyList = createSafeAction(CopyList, handler);