import { auth } from "@clerk/nextjs";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { MoveToNextList } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        console.error("Auth error: Nincs azonosítva!");
        return {
            error: "Nincs azonosítva!",
        };
    }

    const { id, boardId } = data;
    let card;

    try {
        // console.log("Kártya keresése ID alapján:", id);
        card = await db.card.findUnique({
            where: {
                id,
            },
        });

        if (!card) {
            console.error("Error: A kártya nem található");
            throw new Error('A kártya nem található');
        }

        // console.log("Jelenlegi lista keresése ID alapján:", card.listId);
        const currentList = await db.list.findUnique({
            where: {
                id: card.listId,
            },
        });

        if (!currentList) {
            console.error("Error: A jelenlegi lista nem található");
            throw new Error('A jelenlegi lista nem található');
        }

        // console.log("Következő lista keresése a board ID és az aktuális lista order alapján:", currentList.boardId, currentList.order);
        const nextList = await db.list.findFirst({
            where: {
                boardId: currentList.boardId,
                order: {
                    gt: currentList.order,
                },
            },
            orderBy: {
                order: 'asc',
            },
        });

        if (!nextList) {
            console.error("Error: A kártyát nem lehet áthelyezni a következő listába");
            throw new Error('A kártyát nem lehet áthelyezni a következő listába');
        }

        // console.log("Utolsó kártya keresése a következő listában:", nextList.id);
        const lastCardInNextList = await db.card.findFirst({
            where: {
                listId: nextList.id,
            },
            orderBy: {
                order: 'desc',
            },
        });

        const newPosition = (lastCardInNextList?.order || 0) + 1;
        // console.log("Új pozíció a kártyának:", newPosition);

        // console.log("Kártya frissítése új listával és pozícióval");
        await db.card.update({
            where: {
                id,
            },
            data: {
                listId: nextList.id,
                order: newPosition,
            },
        });

        await createAuditLog({
            entityTitle: card.title,
            entityId: card.id,
            entityType: ENTITY_TYPE.CARD,
            action: ACTION.UPDATE,
        });
    } catch (error) {
        console.error("Move to next list error:", error);
        return {
            error: "Sikertelen áthelyezés!",
        };
    }

    revalidatePath(`/board/${boardId}`);
    return { data: card };
};

export const moveToNextList = createSafeAction(MoveToNextList, handler);
