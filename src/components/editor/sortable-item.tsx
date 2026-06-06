"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  children: (props: {
    attributes: any;
    listeners: any;
    setNodeRef: (node: HTMLElement | null) => void;
    transform: any;
    transition: string | undefined;
    isDragging: boolean;
  }) => React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return children({
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  });
}
