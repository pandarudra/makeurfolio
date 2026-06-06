"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { normalizeSocialLink, getSocialIconComponent } from "@/src/lib/social-utils";
import { SortableList } from "./sortable-list";
import { SortableItem } from "./sortable-item";
import { CSS } from "@dnd-kit/utilities";

export function SocialSection() {
  const { portfolio, updateField } = useEditor();

  if (!portfolio) return null;

  const socialLinks = portfolio.socialLinks || [];

  const handleAdd = () => {
    const newLinks = [...socialLinks, { id: `new-${Date.now()}`, label: "New Link", url: "", icon: "link", visible: true, sortOrder: socialLinks.length }];
    updateField("socialLinks", newLinks);
  };

  const handleUpdate = (index: number, field: string, value: any) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    
    // Auto-update icon and label if URL changes
    if (field === "url") {
      const normalized = normalizeSocialLink(value);
      newLinks[index].icon = normalized.icon;
      // If label is empty or just "New Link" or looks auto-generated, auto-update label too
      if (!newLinks[index].label || newLinks[index].label === "New Link" || newLinks[index].label === "Website") {
        newLinks[index].label = normalized.label;
      }
    }
    
    updateField("socialLinks", newLinks);
  };

  const handleRemove = (index: number) => {
    const newLinks = [...socialLinks];
    newLinks.splice(index, 1);
    // Re-assign sortOrder
    newLinks.forEach((link, i) => link.sortOrder = i);
    updateField("socialLinks", newLinks);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">Social Links</h2>
        <p className="text-sm text-secondary">Manage your online presence and external links.</p>
      </div>
      <SortableList 
        items={socialLinks.map((l: any, i: number) => ({ ...l, id: l.id || `temp-${i}` }))} 
        onDragEnd={(newItems) => updateField("socialLinks", newItems)}
      >
        {socialLinks.map((link: any, index: number) => {
          const Icon = getSocialIconComponent(link.icon);
          const itemId = link.id || `temp-${index}`;
          return (
            <SortableItem key={itemId} id={itemId}>
              {({ attributes, listeners, setNodeRef, transform, transition, isDragging }) => (
                <div 
                  ref={setNodeRef}
                  style={{ 
                    transform: CSS.Translate.toString(transform), 
                    transition,
                    zIndex: isDragging ? 50 : 1,
                  }}
                  className={`bg-input-bg border rounded-xl p-4 transition-all ${
                    !link.visible ? 'opacity-60 border-dashed border-border/40' : 'border-border/40'
                  } ${isDragging ? 'opacity-50 border-foreground/50 shadow-lg' : ''}`}
                >
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-1 items-center justify-center text-secondary/40 hover:text-foreground cursor-grab active:cursor-grabbing transition-colors p-2 -ml-2" {...attributes} {...listeners}>
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-4">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                            <Icon className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={link.label || ""}
                            onChange={(e) => handleUpdate(index, "label", e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                            placeholder="Platform (e.g. GitHub)"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={link.url || ""}
                            onChange={(e) => handleUpdate(index, "url", e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                            placeholder="URL (https://...)"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdate(index, "visible", !link.visible)}
                        className={`p-2 rounded-md transition-colors ${
                          link.visible 
                            ? 'text-foreground hover:bg-border/40' 
                            : 'text-secondary hover:bg-border/20'
                        }`}
                        title={link.visible ? "Hide on portfolio" : "Show on portfolio"}
                      >
                        {link.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleRemove(index)}
                        className="p-2 text-secondary/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </SortableItem>
          );
        })}
      </SortableList>
      <button
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border/60 rounded-xl text-sm font-medium text-secondary hover:text-foreground hover:border-foreground/30 hover:bg-input-bg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Social Link
      </button>
    </div>
  );
}
