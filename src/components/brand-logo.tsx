import React from "react";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
};

export function BrandLogo({
  className = "",
  markClassName = "",
  wordmarkClassName = "",
  showWordmark = true,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        className={`h-6 w-6 flex-shrink-0 ${markClassName}`}
        viewBox="0 0 48 48"
        role="img"
        aria-label="makeurfolio logo"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="12" fill="currentColor" />
        <path
          d="M14.5 31.5V16.75C14.5 15.78 15.28 15 16.25 15H29.3L34.5 20.2V31.5"
          fill="none"
          stroke="var(--background)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.6"
        />
        <path
          d="M29.5 15.75V20.5H34.25"
          fill="none"
          stroke="var(--background)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.6"
        />
        <path
          d="M14.5 31.5C18.9 27.6 23.35 27.6 27.8 31.5C30.1 33.55 32.2 33.75 34.5 31.5"
          fill="none"
          stroke="var(--accent)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.6"
        />
        <circle cx="35" cy="31" r="3.75" fill="var(--accent)" />
      </svg>

      {showWordmark && (
        <span className={`text-sm font-semibold tracking-tight text-foreground ${wordmarkClassName}`}>
          makeurfolio
        </span>
      )}
    </div>
  );
}
