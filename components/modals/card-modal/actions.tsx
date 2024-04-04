"use client"

import { toast } from "sonner";
import { Copy, Trash } from "lucide-react";
import { useParams } from "next/navigation";

import { CardWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { copyCard } from "@/actions/copy-card";
import { Button } from "@/components/ui/button";
import { deleteCard } from "@/actions/delete-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCardModal } from "@/hooks/use-card-model";

interface ActionProps {
    data: CardWithList;
};

export const Actions = ({
    data,
}: ActionProps) => {
    const params = useParams();
    const cardModal = useCardModal();

    const { 
        execute: executeCopyCard,
        isLoading: isLoadingCopy,
    } = useAction(copyCard, {
        onSuccess: (data) => {
            toast.success(`Kártya "${data.title}" sikeresen másolva!`);
            cardModal.onClose();
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const { 
        execute: executeDeleteCard,
        isLoading: isLoadingDelete,
    } = useAction(deleteCard, {
        onSuccess: (data) => {
            toast.success(`Kártya "${data.title}" sikeresen törölve!`);
            cardModal.onClose();
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const onCopy = () => {
        const boardId = params.boardId as string;

        executeCopyCard({
            id: data.id,
            boardId,
        });
    };

    const onDelete = () => {
        const boardId = params.boardId as string;

        executeDeleteCard({
            id: data.id,
            boardId,
        });
    };

    return (
        <div className="space-y-2 mt-2">
            <p className="text-xs font-semibold">
                Műveletek
            </p>
            <Button
                onClick={onCopy}
                disabled={isLoadingCopy}
                variant="gray"
                className="w-full justify-start"
                size="inline"
            >
                <Copy className="h-4 w-4 mr-2"/>
                Másolás
            </Button>
            <Button
                onClick={onDelete}
                disabled={isLoadingDelete}
                variant="destructive"
                className="w-full justify-start"
                size="inline"
            >
                <Trash className="h-4 w-4 mr-2"/>
                Törlés
            </Button>
        </div>
    );
};

Actions.Skeleton = function ActionSkeleton() {
    return (
        <div className="space-y-2 mt-2">
            <Skeleton className="w-20 h-4 bg-neutral-200" />
            <Skeleton className="w-full h-8 bg-neutral-200" />
            <Skeleton className="w-full h-8 bg-neutral-200" />
        </div>
    )
}