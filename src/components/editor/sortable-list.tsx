"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

interface SortableListProps {
  items: any[];
  onDragEnd: (newItems: any[]) => void;
  children: React.ReactNode;
  horizontal?: boolean;
}

export function SortableList({ items, onDragEnd, children, horizontal = false }: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires a 5px drag to activate (helps prevent accidental drags on clicks)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onDragEnd(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext 
        items={items.map((item) => item.id)} 
        strategy={horizontal ? horizontalListSortingStrategy : verticalListSortingStrategy}
      >
        <div className={horizontal ? "flex flex-wrap gap-2" : "space-y-4"}>
           {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}
