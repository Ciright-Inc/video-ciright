"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

interface SearchFormProps {
  defaultQuery?: string;
}

export function SearchForm({ defaultQuery = "" }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultQuery);
  const [prevDefaultQuery, setPrevDefaultQuery] = useState(defaultQuery);
  if (defaultQuery !== prevDefaultQuery) {
    setPrevDefaultQuery(defaultQuery);
    setQuery(defaultQuery);
  }

  useEffect(() => {
    if (searchParams.get("focus") === "1") {
      const input = document.getElementById("search-page-input");
      input?.focus();
    }
  }, [searchParams]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 md:hidden">
      <InputGroup className="h-11 overflow-hidden rounded-[var(--radius-pill)] bg-muted focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40 has-[[data-slot=input-group-control]:focus-visible]:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0">
        <InputGroupInput
          id="search-page-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="h-11 rounded-l-[var(--radius-pill)] bg-muted pl-4"
        />
        <InputGroupAddon align="inline-end" className="p-0">
          <InputGroupButton
            type="submit"
            variant="secondary"
            className="h-11 w-16 rounded-r-[var(--radius-pill)] rounded-l-none border-l border-border bg-secondary px-0 hover:bg-secondary/80"
            aria-label="Search"
          >
            <Search className="size-5" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
