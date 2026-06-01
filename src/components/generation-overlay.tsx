"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearActiveGenerationId, getActiveGenerationMetadata, clearActiveGenerationMetadata } from "@/src/lib/storage";

interface GenerationOverlayProps {
  generationId: string | null;
  onClose: () => void;
}

type Status = "QUEUED" | "FETCHING_GITHUB" | "PARSING_RESUME" | "GENERATING_PROFILE" | "COMPLETED" | "FAILED";

export function GenerationOverlay({ generationId, onClose }: GenerationOverlayProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({ hasGithub: true, hasResume: true });

  useEffect(() => {
    if (generationId) {
      setMetadata(getActiveGenerationMetadata());
    }
  }, [generationId]);

  const steps = [
    ...(metadata.hasGithub ? [{ id: "FETCHING_GITHUB", label: "Analyzing GitHub" }] : []),
    ...(metadata.hasResume ? [{ id: "PARSING_RESUME", label: "Parsing Resume" }] : []),
    { id: "GENERATING_PROFILE", label: "Gemini is crafting your profile" },
    { id: "COMPLETED", label: "Portfolio ready" },
  ];

  useEffect(() => {
    if (!generationId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/portfolio/generation/${generationId}`);
        const json = await res.json();
        
        if (json.success) {
          setStatus(json.data.status);
          if (json.data.status === "COMPLETED") {
            setPortfolioSlug(json.data.portfolioSlug);
            clearActiveGenerationId();
            clearActiveGenerationMetadata();
            clearInterval(interval);
          } else if (json.data.status === "FAILED") {
            setErrorMessage(json.data.errorMessage || "An unknown error occurred.");
            clearActiveGenerationId();
            clearActiveGenerationMetadata();
            clearInterval(interval);
          }
        } else {
          // If the backend returns success: false (e.g. 404 Not Found for stale IDs)
          setErrorMessage(json.error?.message || "Generation session not found.");
          setStatus("FAILED");
          clearActiveGenerationId();
          clearActiveGenerationMetadata();
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to poll status:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [generationId]);

  if (!generationId) return null;

  const getStepState = (stepId: string) => {
    if (!status) return "waiting";
    if (status === "FAILED") return "waiting"; // Freeze
    
    const currentIndex = steps.findIndex(s => s.id === status);
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (status === "COMPLETED" || stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "waiting";
  };

  const handleTryAgain = () => {
    clearActiveGenerationId();
    clearActiveGenerationMetadata();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background animate-in fade-in duration-300 text-foreground">
      <div className="w-full max-w-lg">
        {status === "FAILED" ? (
          <div className="bg-card-bg rounded-2xl p-8 border border-red-500/20 text-center shadow-sm animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Something interrupted the generation.</h2>
            <p className="text-[13px] text-secondary mb-8">{errorMessage}</p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleTryAgain}
                className="w-full py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-[13px] font-medium transition-all active:scale-[0.98]"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : status === "COMPLETED" && portfolioSlug ? (
          <div className="bg-card-bg rounded-2xl p-8 border border-border/85 text-center shadow-sm animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Your portfolio is live.</h2>
            <p className="text-[13px] text-secondary mb-6">
              Your work now has a home on the internet.
            </p>
            
            <div className="p-4 mb-8 bg-input-bg text-foreground rounded-lg font-mono text-[13px] border border-border/60 break-all">
              {portfolioSlug}.makeurfolio.dev
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push(`/portfolio/${portfolioSlug}`)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-[13px] font-medium transition-all active:scale-[0.98]"
              >
                View Portfolio
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => router.push(`/dashboard`)}
                className="flex-1 py-2.5 bg-input-bg text-foreground hover:bg-border/60 rounded-lg text-[13px] font-medium transition-all active:scale-[0.98]"
              >
                Go To Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-medium tracking-tight text-foreground mb-2">Crafting your portfolio</h2>
              <p className="text-[13px] text-secondary">This usually takes about 10-20 seconds.</p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              {steps.map((step) => {
                const state = getStepState(step.id);
                return (
                  <div key={step.id} className={`flex items-center gap-4 transition-opacity duration-300 ${state === 'waiting' ? 'opacity-30' : 'opacity-100'}`}>
                    {state === "completed" ? (
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                    ) : state === "active" ? (
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <span className="absolute w-2 h-2 bg-foreground rounded-full animate-ping" />
                        <span className="relative w-1.5 h-1.5 bg-foreground rounded-full" />
                      </div>
                    ) : (
                      <Circle className="text-secondary/30 w-5 h-5" />
                    )}
                    <span className={`text-[15px] ${state === 'active' ? 'text-foreground font-medium' : 'text-secondary'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
