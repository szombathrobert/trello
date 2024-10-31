// card-item.tsx

import { Separator } from "@/components/ui/separator";
import { useCardModal } from "@/hooks/use-card-model";
import { Draggable } from "@hello-pangea/dnd";
import { Card } from "@prisma/client";

interface CardItemProps {
  data: Card;
  index: number;
}

export const CardItem = ({ data, index }: CardItemProps) => {
  const cardModal = useCardModal();

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          className="relative border-2 border-transparent hover:border-black py-2 px-3 text-sm bg-white rounded-md shadow-sm"
        >
          {/* Címkék megjelenítése */}
          {data.label && (
            <div className={`absolute top-0 right-0 transform -translate-y-1/2 -translate-x-1/2 rounded-full px-2 py-1 text-xs font-semibold ${data.labelColor}`}>
              {data.label}
            </div>
          )}
          
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{data.description}</p>
            <Separator className="my-2" />
            <div className="flex items-center whitespace-pre-wrap">{data.title}</div>
          </div>
        </div>
      )}
    </Draggable>
  );
};