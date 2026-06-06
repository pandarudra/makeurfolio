"use client";

import React, { useState } from "react";
import { useEditor } from "./editor-context";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { EditorSwitch } from "./editor-switch";
import { SortableList } from "./sortable-list";
import { SortableItem } from "./sortable-item";
import { CSS } from "@dnd-kit/utilities";

export function CertificationsSection() {
  const { portfolio, updateField } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!portfolio) return null;

  const certifications = portfolio.certifications || [];

  const handleAdd = () => {
    const newId = `new-${Date.now()}`;
    const newItem = {
      id: newId,
      title: "",
      issuer: "",
      issueDate: null,
      credentialUrl: "",
      sortOrder: certifications.length,
    };
    updateField("certifications", [...certifications, newItem]);
    setEditingId(newId);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = certifications.map((cert: any) => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    updateField("certifications", updated);
  };

  const handleDelete = (id: string) => {
    const updated = certifications.filter((cert: any) => cert.id !== id);
    updateField("certifications", updated);
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
          <h2 className="text-xl font-semibold text-foreground mb-1">Certifications</h2>
          <p className="text-sm text-secondary">Manage your professional certifications and licenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${portfolio.showCertifications ? 'text-foreground' : 'text-secondary/60'}`}>
            {portfolio.showCertifications ? 'Visible' : 'Hidden'}
          </span>
          <EditorSwitch 
            checked={portfolio.showCertifications} 
            onChange={(v) => updateField("showCertifications", v)} 
          />
        </div>
      </div>
      <SortableList 
        items={certifications} 
        onDragEnd={(newItems) => {
          const updatedWithOrder = newItems.map((item, index) => ({...item, sortOrder: index}));
          updateField("certifications", updatedWithOrder);
        }}
      >
        {certifications.map((cert: any) => {
          const isEditing = editingId === cert.id;
          
          return (
            <SortableItem key={cert.id} id={cert.id}>
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
                    onClick={() => toggleEdit(cert.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="p-1 -ml-1 text-secondary/40 hover:text-foreground cursor-grab active:cursor-grabbing transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{cert.title || "Certification Title"}</h3>
                        <p className="text-sm text-secondary">{cert.issuer || "Issuer Name"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(cert.id); }}
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
                        <label className="text-xs font-medium text-foreground">Certification Title</label>
                        <input
                          type="text"
                          value={cert.title || ""}
                          onChange={(e) => handleUpdate(cert.id, "title", e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                          placeholder="e.g. AWS Certified Solutions Architect"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Issuer</label>
                        <input
                          type="text"
                          value={cert.issuer || ""}
                          onChange={(e) => handleUpdate(cert.id, "issuer", e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                          placeholder="e.g. Amazon Web Services"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Issue Date</label>
                        <input
                          type="date"
                          value={cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => handleUpdate(cert.id, "issueDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground flex items-center justify-between">
                          Credential URL
                        </label>
                        <input
                          type="text"
                          value={cert.credentialUrl || ""}
                          onChange={(e) => handleUpdate(cert.id, "credentialUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-shadow"
                          placeholder="https://..."
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
        <span className="text-sm font-medium">Add Certification</span>
      </button>
    </div>
  );
}
