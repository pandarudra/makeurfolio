"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { X, Plus, GripVertical } from "lucide-react";
import { SortableList } from "./sortable-list";
import { SortableItem } from "./sortable-item";
import { CSS } from "@dnd-kit/utilities";

export function SkillsSection() {
  const { portfolio, updateField } = useEditor();
  const [newSkill, setNewSkill] = useState("");

  if (!portfolio) return null;

  const skills = portfolio.skills || [];

  const handleAddSkill = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newSkill.trim()) return;

    // Check if skill already exists
    if (skills.some((s: any) => s.name.toLowerCase() === newSkill.trim().toLowerCase())) {
      setNewSkill("");
      return;
    }

    const updatedSkills = [
      ...skills, 
      { id: `skill-${Date.now()}`, name: newSkill.trim(), category: "OTHER", sortOrder: skills.length } // Default category
    ];
    
    updateField("skills", updatedSkills);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillName: string) => {
    const updatedSkills = skills.filter((s: any) => s.name !== skillName);
    updateField("skills", updatedSkills);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">Skills</h2>
        <p className="text-sm text-secondary">Manage your technical skills and core competencies.</p>
      </div>
      <div className="bg-input-bg border border-border/40 rounded-xl p-6">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Add Skills</label>
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
              placeholder="e.g. React, Node.js, Python..."
            />
            <button
              type="submit"
              disabled={!newSkill.trim()}
              className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>
        </div>

        <SortableList 
          horizontal={true}
          items={skills.map((s: any) => ({ ...s, id: s.id || s.name }))}
          onDragEnd={(newItems) => {
            const updatedWithOrder = newItems.map((item, index) => ({...item, sortOrder: index}));
            updateField("skills", updatedWithOrder);
          }}
        >
          {skills.map((skill: any, idx: number) => {
            const itemId = skill.id || skill.name;
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
                    className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 bg-background border rounded-full text-sm font-medium text-foreground group transition-all ${
                      isDragging ? 'opacity-50 border-foreground/50 shadow-md' : 'border-border/60 hover:border-border'
                    }`}
                  >
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-secondary/40 hover:text-foreground">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    {skill.name}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveSkill(skill.name); }}
                      className="text-secondary/50 hover:text-red-500 transition-colors rounded-full p-0.5 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </SortableItem>
            );
          })}
          {skills.length === 0 && (
            <p className="text-sm text-secondary/60 italic">No skills added yet.</p>
          )}
        </SortableList>
      </div>
    </div>
    </div>
  );
}
