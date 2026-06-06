"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { EditorSwitch } from "./editor-switch";
import { SortableList } from "./sortable-list";
import { SortableItem } from "./sortable-item";
import { CSS } from "@dnd-kit/utilities";

export function AchievementsSection() {
  const { portfolio, updateField } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!portfolio) return null;

  const achievements = portfolio.achievements || [];

  const handleAdd = () => {
    const newId = `new-${Date.now()}`;
    const newItem = {
      id: newId,
      title: "",
      description: "",
      achievedAt: null,
      sortOrder: achievements.length,
    };
    updateField("achievements", [...achievements, newItem]);
    setEditingId(newId);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = achievements.map((ach: any) => 
      ach.id === id ? { ...ach, [field]: value } : ach
    );
    updateField("achievements", updated);
  };

  const handleDelete = (id: string) => {
    const updated = achievements.filter((ach: any) => ach.id !== id);
    updateField("achievements", updated);
    if (editingId === id) setEditingId(null);
  };

  const toggleEdit = (id: string) => {
    if (editingId === id) {
      setEditingId(null);
    } else {
      setEditingId(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Achievements</h2>
          <p className="text-sm text-secondary">Manage your awards, publications, and honors.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${portfolio.showAchievements ? 'text-foreground' : 'text-secondary/60'}`}>
            {portfolio.showAchievements ? 'Visible' : 'Hidden'}
          </span>
          <EditorSwitch 
            checked={portfolio.showAchievements} 
            onChange={(v) => updateField("showAchievements", v)} 
          />
        </div>
      </div>
      <SortableList 
        items={achievements} 
        onDragEnd={(newItems) => {
          const updatedWithOrder = newItems.map((item, index) => ({...item, sortOrder: index}));
          updateField("achievements", updatedWithOrder);
        }}
      >
        {achievements.map((ach: any) => {
          const isEditing = editingId === ach.id;
          
          return (
            <SortableItem key={ach.id} id={ach.id}>
              {({ attributes, listeners, setNodeRef, transform, transition, isDragging }) => (
                <div 
                  ref={setNodeRef}
                  style={{ 
                    transform: CSS.Translate.toString(transform), 
                    transition,
                    zIndex: isDragging ? 50 : 1,
                  }}
                  className={`bg-input-bg border rounded-xl overflow-hidden transition-all ${
                    isDragging ? 'opacity-50 border-foreground/50 shadow-lg' : 'border-border/40'
                  }`}
                >
                  <div 
                    className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-border/20 transition-colors"
                    onClick={() => toggleEdit(ach.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="p-1 -ml-1 text-secondary/40 hover:text-foreground cursor-grab active:cursor-grabbing transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{ach.title || "Achievement Title"}</h3>
                        <p className="text-sm text-secondary line-clamp-1 max-w-md">
                          {ach.description || "No description provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(ach.id); }}
                        className="p-1.5 text-secondary/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-secondary/50 p-1.5">
                        {isEditing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="px-6 py-5 border-t border-border/40 bg-background/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-medium text-foreground">Achievement Title</label>
                        <input
                          type="text"
                          value={ach.title || ""}
                          onChange={(e) => handleUpdate(ach.id, "title", e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                          placeholder="e.g. Employee of the Year"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-medium text-foreground">Date Achieved</label>
                        <input
                          type="date"
                          value={ach.achievedAt ? new Date(ach.achievedAt).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleUpdate(ach.id, "achievedAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-medium text-foreground">Description</label>
                        <textarea
                          value={ach.description || ""}
                          onChange={(e) => handleUpdate(ach.id, "description", e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow resize-y"
                          placeholder="Describe your achievement..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SortableItem>
          );
        })}
      </SortableList>

      <button
        onClick={handleAdd}
        className="w-full py-4 border border-dashed border-border/60 hover:border-foreground/50 rounded-xl flex flex-col items-center justify-center gap-2 text-secondary hover:text-foreground hover:bg-input-bg transition-all group"
      >
        <div className="p-2 rounded-full bg-border/40 group-hover:bg-foreground/10 transition-colors">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium">Add Achievement</span>
      </button>
    </div>
  );
}
