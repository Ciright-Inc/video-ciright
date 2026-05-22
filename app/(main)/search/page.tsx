import { Suspense } from "react";
import { searchVideosPage } from "@/lib/data/videos";
import { SearchForm } from "@/components/search/SearchForm";
import { VirtualVideoGrid } from "@/components/video/VirtualVideoGrid";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; focus?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const initialPage = query ? await searchVideosPage(query) : undefined;
  const resultCount = initialPage?.items.length ?? 0;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink">Search results</h1>
      <Suspense fallback={null}>
        <SearchForm defaultQuery={query} />
      </Suspense>
      {query ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {resultCount} result{resultCount !== 1 ? "s" : ""} for &quot;{query}&quot;
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground md:hidden">
            Search for videos
          </p>
          <p className="mb-6 hidden text-sm text-muted-foreground md:block">
            Enter a search term in the top bar.
          </p>
        </>
      )}
      <VirtualVideoGrid
        feed={{ type: "search", query }}
        initialPage={initialPage}
        title={query ? "No results found" : undefined}
        description={
          query
            ? `We couldn't find any videos matching "${query}". Try different keywords.`
            : undefined
        }
        action={query ? null : undefined}
      />
    </div>
  );
}
