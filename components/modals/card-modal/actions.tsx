// actions.tsx

import { toast } from "sonner";
import { Copy, Trash, ArrowDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';

import { CardWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { copyCard } from "@/actions/copy-card";
import { Button } from "@/components/ui/button";
import { deleteCard } from "@/actions/delete-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCardModal } from "@/hooks/use-card-model";

interface ActionProps {
    data: CardWithList;
}

const doctorOptions = [
    { name: 'Szalai Dr.', color: 'bg-red-600' },
    { name: 'Oczella Dr.', color: 'bg-purple-600' },
    { name: 'Madácsy Dr.', color: 'bg-yellow-600' },
    { name: 'Mohos Dr.', color: 'bg-orange-600' },
];

export const Actions = ({ data }: ActionProps) => {
    const params = useParams();
    const router = useRouter();
    const cardModal = useCardModal();
    const [isCardMoved, setIsCardMoved] = useState(false);
    const [label, setLabel] = useState<string[]>([]);

    useEffect(() => {
        // Frissítsük a címkék helyi állapotát, ha a kártya adatai megváltoznak
        if (data.label) {
            if (Array.isArray(data.label)) {
                setLabel(data.label);
            } else {
                setLabel([data.label]); // Ha csak egyetlen érték van, akkor tegyük egy tömbbe
            }
        } else {
            setLabel([]); // Ha nincs címke, üres tömböt állítsunk be
        }
    }, [data.label]);

    const { execute: executeCopyCard, isLoading: isLoadingCopy } = useAction(copyCard, {
        onSuccess: (data) => {
            toast.success(`Kártya "${data.title}" sikeresen másolva!`);
            cardModal.onClose();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeDeleteCard, isLoading: isLoadingDelete } = useAction(deleteCard, {
        onSuccess: (data) => {
            toast.success(`Kártya "${data.title}" sikeresen törölve!`);
            cardModal.onClose();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onCopy = () => {
        const boardId = params?.boardId as string;

        executeCopyCard({
            id: data.id,
            boardId,
        });
    };

    const onDelete = () => {
        const boardId = params?.boardId as string;

        executeDeleteCard({
            id: data.id,
            boardId,
        });
    };

    const moveToNextListHandler = async () => {
        const boardId = params?.boardId as string;

        try {
            const response = await fetch("/api/move-card", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: data.id,
                    boardId,
                }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }

            toast.success("A kártya sikeresen áthelyezve a következő listába!");
            setIsCardMoved(true); // Állapot beállítása a kártya áthelyezés jelzésére

            window.location.reload();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Hiba történt az áthelyezés során!";
            toast.error(errorMessage);
        }
    };

    const handleLabelClick = async (label: string, color: string) => {
        const boardId = params?.boardId as string;

        try {
            const response = await fetch("/api/set-label", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cardId: data.id,
                    labels: { label, labelColor: color }
                }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message);
            }

            toast.success(`Címke "${label}" sikeresen beállítva!`);
            
            // Az oldal frissítése a sikeres címke beállítása után
            router.refresh();

            window.location.reload();

        } catch (error) {
            // Hibakezelés
            const errorMessage = error instanceof Error ? error.message : "Hiba történt a címke beállítása során!";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-2 mt-2">
            <p className="text-xs font-semibold">Műveletek</p>
            
            <Button
                onClick={onCopy}
                disabled={isLoadingCopy}
                variant="gray"
                className="w-full justify-start"
                size="inline"
            >
                <Copy className="h-4 w-4 mr-2" />
                Másolás
            </Button>
            <Button
                onClick={onDelete}
                disabled={isLoadingDelete}
                variant="destructive"
                className="w-full justify-start"
                size="inline"
            >
                <Trash className="h-4 w-4 mr-2" />
                Törlés
            </Button>
            <Button onClick={moveToNextListHandler} variant="primary" className="w-full justify-start bg-cyan-500" size="inline">
                <ArrowDown className="h-4 w-4 mr-2" />
                Következő oszlop aljára
            </Button>

            <Button
                onClick={() => handleLabelClick("All-In", "bg-blue-600")}
                variant={label.includes("All-In") ? "secondary" : "primary"}
                className="w-full justify-start"
                size="inline"
            >
                All-In
            </Button>

            <Button
                onClick={() => handleLabelClick("Navi", "bg-green-600")}
                variant={label.includes("Navi") ? "secondary" : "primary"}
                className={`w-full justify-start ${label.includes("Navi") ? "bg-green-600 text-white" : ""}`}
                size="inline"
            >
                Navi
            </Button>

            <select
                onChange={(e) => {
                    const selectedOption = doctorOptions.find(option => option.name === e.target.value);
                    if (selectedOption) {
                        handleLabelClick(selectedOption.name, selectedOption.color);
                    }
                }}
                className="w-full p-2 border rounded"
            >
                <option value="">Válassz orvost</option>
                {doctorOptions.map((option) => (
                    <option key={option.name} value={option.name}>
                        {option.name}
                    </option>
                ))}
            </select>
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
    );
};