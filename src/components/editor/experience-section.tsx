"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { EditorSwitch } from "./editor-switch";
import { SortableList } from "./sortable-list";
import { SortableItem } from "./sortable-item";
import { CSS } from "@dnd-kit/utilities";

export function ExperienceSection() {
  const { portfolio, updateField } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!portfolio) return null;

  const experiences = portfolio.experiences || [];

  const handleAdd = () => {
    const newId = `new-${Date.now()}`;
    const newItem = {
      id: newId,
      company: "",
      role: "",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
      currentlyWorking: true,
      description: "",
      sortOrder: experiences.length,
    };
    updateField("experiences", [...experiences, newItem]);
    setEditingId(newId);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = experiences.map((exp: any) => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateField("experiences", updated);
  };

  const handleDelete = (id: string) => {
    const updated = experiences.filter((exp: any) => exp.id !== id);
    updateField("experiences", updated);
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
          <h2 className="text-xl font-semibold text-foreground mb-1">Experience</h2>
          <p className="text-sm text-secondary">Manage your professional work experience.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${portfolio.showExperience ? 'text-foreground' : 'text-secondary/60'}`}>
            {portfolio.showExperience ? 'Visible' : 'Hidden'}
          </span>
          <EditorSwitch 
            checked={portfolio.showExperience} 
            onChange={(v) => updateField("showExperience", v)} 
          />
        </div>
      </div>

      <SortableList 
        items={experiences} 
        onDragEnd={(newItems) => updateField("experiences", newItems)}
      >
        {experiences.map((exp: any) => {
          const isEditing = editingId === exp.id;
          
          return (
            <SortableItem key={exp.id} id={exp.id}>
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
                    onClick={() => toggleEdit(exp.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="p-1 -ml-1 text-secondary/40 hover:text-foreground cursor-grab active:cursor-grabbing transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{exp.role || "Role / Position"}</h3>
                        <p className="text-sm text-secondary">{exp.company || "Company Name"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
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
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Role / Position</label>
                        <input
                          type="text"
                          value={exp.role || ""}
                          onChange={(e) => handleUpdate(exp.id, "role", e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                          placeholder="e.g. Senior Software Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Company Name</label>
                        <input
                          type="text"
                          value={exp.company || ""}
                          onChange={(e) => handleUpdate(exp.id, "company", e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                          placeholder="e.g. Google"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Start Date</label>
                        <input
                          type="date"
                          value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleUpdate(exp.id, "startDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground flex items-center justify-between">
                          <span>End Date</span>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={exp.currentlyWorking || false}
                              onChange={(e) => {
                                handleUpdate(exp.id, "currentlyWorking", e.target.checked);
                                if (e.target.checked) handleUpdate(exp.id, "endDate", null);
                              }}
                              className="rounded border-border/40 text-foreground focus:ring-foreground/50"
                            />
                            <span className="text-secondary font-normal">Present</span>
                          </label>
                        </label>
                        <input
                          type="date"
                          value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleUpdate(exp.id, "endDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                          disabled={exp.currentlyWorking}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-medium text-foreground">Description</label>
                        <textarea
                          value={exp.description || ""}
                          onChange={(e) => handleUpdate(exp.id, "description", e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow resize-y"
                          placeholder="Describe your responsibilities and achievements..."
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
        <span className="text-sm font-medium">Add Experience</span>
      </button>
    </div>
  );
}
