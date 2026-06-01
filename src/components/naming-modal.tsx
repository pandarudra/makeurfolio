"use client";

import React, { useState } from "react";
import { X, ArrowRight } from "lucide-react";

interface NamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  defaultName?: string;
}

export function NamingModal({ isOpen, onClose, onSubmit, defaultName = "" }: NamingModalProps) {
  const [name, setName] = useState(defaultName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length >= 3 && trimmed.length <= 60) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card-bg rounded-2xl shadow-xl overflow-hidden border border-border text-foreground">
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-input-bg text-secondary hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Name your portfolio</h2>
            <p className="text-[13px] text-secondary">
              This will help you organize and manage multiple portfolios later.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Utkal's Developer Portfolio"
              minLength={3}
              maxLength={60}
              required
              className="w-full px-4 py-2.5 bg-input-bg text-[13px] text-foreground border border-transparent focus:border-border rounded-lg outline-none focus:ring-0 placeholder:text-secondary/60 transition-colors"
            />
            
            <button
              type="submit"
              disabled={name.trim().length < 3}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-[13px] font-medium transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Generate Portfolio
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
