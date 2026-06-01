"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GenerationOverlay } from "./generation-overlay";
import {
  restoreStashedState,
  clearStashedState,
  setActiveGenerationId,
  getActiveGenerationId,
  clearActiveGenerationId,
} from "@/src/lib/storage";

export function DashboardGenerationHandler() {
  const router = useRouter();
  const [generationId, setGenerationId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if there is already an active generation running
    const activeGenId = getActiveGenerationId();
    if (activeGenId) {
      setGenerationId(activeGenId);
      return;
    }

    // 2. Otherwise, check if there is a stashed state ready to generate
    restoreStashedState().then(async (stashed) => {
      if (stashed && stashed.portfolioName) {
        // Pre-allocate a client-side generation ID
        const clientGenId = "gen-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
        
        // Save and activate immediately
        setGenerationId(clientGenId);
        setActiveGenerationId(clientGenId);

        const formData = new FormData();
        if (stashed.githubUsername) formData.append("githubUsername", stashed.githubUsername);
        if (stashed.resumeFile) formData.append("resume", stashed.resumeFile);
        formData.append("portfolioName", stashed.portfolioName);
        formData.append("generationId", clientGenId);

        // Clear stashed state early so we don't trigger duplicate calls on refresh
        await clearStashedState();

        try {
          const res = await fetch("/api/portfolio/generate", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          if (!data.success) {
            alert(data.error?.message || "Failed to generate portfolio");
            setGenerationId(null);
            clearActiveGenerationId();
          }
        } catch (err) {
          console.error("Failed to generate portfolio:", err);
          alert("Network error starting generation");
          setGenerationId(null);
          clearActiveGenerationId();
        }
      }
    });
  }, []);

  const handleClose = () => {
    setGenerationId(null);
    clearActiveGenerationId();
    // Refresh the page so the newly generated portfolio is rendered in the server-side list
    window.location.reload();
  };

  if (!generationId) return null;

  return (
    <GenerationOverlay 
      generationId={generationId} 
      onClose={handleClose} 
    />
  );
}
