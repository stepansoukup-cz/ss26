"use client";

import { useCallback } from "react";

function resize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/**
 * Textarea, která se sama výškově přizpůsobuje obsahu — žádné ruční roztahování.
 * Roste s každým novým řádkem a po načtení se nastaví podle počátečního obsahu.
 */
export function AutoGrowTextarea({
  className,
  onInput,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const setRef = useCallback((el: HTMLTextAreaElement | null) => {
    if (el) {
      resize(el);
    }
  }, []);

  return (
    <textarea
      ref={setRef}
      className={className}
      onInput={(event) => {
        resize(event.currentTarget);
        onInput?.(event);
      }}
      {...props}
    />
  );
}
