"use server"

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CopyCard } from "./schema";
import { InputType, ReturnType } from "./types"

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
      return {
          error: "Nincs azonosítva!",
      };
  }

  const { id, boardId } = data;
  let card;

  try {
      const CardToCopy = await db.card.findUnique({
          where: {
              id,
              list: {
                  board: {
                      orgId,
                  },
              }
          },
      });

      if (!CardToCopy) {
          return { error: "Kártya nem található!" };
      }

      const lastCard = await db.card.findFirst({
          where: { listId: CardToCopy.listId },
          orderBy: { order: "desc" },
          select: { order: true },
      });

      const newOrder = lastCard ? lastCard.order + 1 : 1;

      // Create the list
      card = await db.card.create({
          data: {
              listId: CardToCopy.listId,
              title: `${CardToCopy.title} - Másolata`,
              description: CardToCopy.description,
              order: newOrder,
          },

      });

    } catch (error) {
      return {
        error: "Sikertelen másolás."
      }
    }

  revalidatePath(`/board/${boardId}`);
  return { data: card };
};

export const copyCard = createSafeAction(CopyCard, handler);