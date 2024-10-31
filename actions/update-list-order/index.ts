"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateListOrder } from "./schema";
import { InputType, ReturnType } from "./types";

const MAX_RETRIES = 3;

const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return {
            error: "Nincs azonosítva!",
        };
    }

    const { items, boardId } = data;

    if (!items || items.length === 0) {
        return { error: "Nincsenek átrendezendő listák!" };
    }

    let lists;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            const transaction = items.map((list) => 
                db.list.update({
                    where: {
                        id: list.id,
                        board: {
                            orgId,
                        },
                    },
                    data: {
                        order: list.order,
                    },
                })
            );

            lists = await db.$transaction(transaction);
            break; // Sikeres tranzakció esetén lépj ki a ciklusból
        } catch (error) {
            console.error("Hiba az átrendezés során:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
                attempts++;
                console.warn(`Újrapróbálkozás: ${attempts}`);
                if (attempts === MAX_RETRIES) {
                    return {
                        error: "Sikertelen átrendezés, próbáld meg később!",
                    };
                }
            } else {
                return {
                    error: "Sikertelen átrendezés!",
                };
            }
        }
    }

    revalidatePath(`/board/${boardId}`);
    return { data: lists };
};

export const updateListOrder = createSafeAction(UpdateListOrder, handler);
