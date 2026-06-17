"use client";

import { useEffect, useRef, useState } from "react";

function cleanTag(raw: string) {
  return raw.replace(/^#+/, "").replace(/\s+/g, " ").trim().slice(0, 40);
}

export function TagsInput({
  name = "tags",
  defaultTags = [],
}: {
  name?: string;
  defaultTags?: string[];
}) {
  const [tags, setTags] = useState<string[]>(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const raw of defaultTags) {
      const value = cleanTag(raw);
      const key = value.toLowerCase();
      if (value && !seen.has(key)) {
        seen.add(key);
        list.push(value);
      }
    }
    return list;
  });
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  const exists = (value: string) =>
    tags.some((tag) => tag.toLowerCase() === value.toLowerCase());

  function addTag(raw: string) {
    const value = cleanTag(raw);
    if (!value || exists(value)) {
      setInput("");
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    setTags((current) => [...current, value]);
    setInput("");
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function removeTag(value: string) {
    setTags((current) => current.filter((tag) => tag !== value));
  }

  // Našeptávač — debounce dotaz na API.
  useEffect(() => {
    const query = input.trim();
    if (!query) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/tags?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { tags: string[] };
        setSuggestions(data.tags.filter((tag) => !exists(tag)));
        setActiveIndex(-1);
      } catch {
        // přerušený požadavek ignorujeme
      }
    }, 180);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, tags]);

  // Zavření dropdownu po kliknutí mimo.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const cleanedInput = cleanTag(input);
  const showCreate =
    cleanedInput.length > 0 &&
    !exists(cleanedInput) &&
    !suggestions.some((tag) => tag.toLowerCase() === cleanedInput.toLowerCase());

  const options = [
    ...suggestions.map((tag) => ({ type: "existing" as const, value: tag })),
    ...(showCreate ? [{ type: "create" as const, value: cleanedInput }] : []),
  ];

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < options.length) {
        addTag(options[activeIndex].value);
      } else if (cleanedInput) {
        addTag(cleanedInput);
      }
      return;
    }

    if (event.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        options.length ? (index + 1) % options.length : -1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        options.length ? (index - 1 + options.length) % options.length : -1,
      );
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {tags.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}

      <div className="flex flex-wrap items-center gap-2 rounded-admin-md border border-admin-border bg-admin-bg px-2.5 py-2 transition focus-within:border-admin-accent focus-within:ring-2 focus-within:ring-admin-accent/25">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-admin-accent-muted px-2.5 py-1 text-sm font-medium text-admin-accent"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Odebrat štítek ${tag}`}
              className="grid h-4 w-4 place-items-center rounded-full text-admin-accent/70 transition hover:bg-admin-accent/15 hover:text-admin-accent"
            >
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </span>
        ))}

        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Začni psát štítek…" : ""}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-admin-text outline-none placeholder:text-admin-faint"
          aria-label="Přidat štítek"
          autoComplete="off"
        />
      </div>

      {open && options.length > 0 ? (
        <ul className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-admin-md border border-admin-border bg-admin-surface py-1 shadow-admin-lg">
          {options.map((option, index) => (
            <li key={`${option.type}-${option.value}`}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => addTag(option.value)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                  index === activeIndex
                    ? "bg-admin-surface-muted text-admin-text"
                    : "text-admin-muted hover:bg-admin-surface-muted"
                }`}
              >
                {option.type === "create" ? (
                  <>
                    <span className="text-admin-faint">Vytvořit</span>
                    <span className="font-medium text-admin-accent">
                      {option.value}
                    </span>
                  </>
                ) : (
                  <span className="font-medium text-admin-text">
                    {option.value}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-2 text-xs text-admin-faint">
        Piš a potvrď Enterem. Existující štítky se našeptají, nové se vytvoří.
        Nepoužívané štítky se z databáze automaticky odstraní.
      </p>
    </div>
  );
}
