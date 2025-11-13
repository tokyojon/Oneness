'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchResults } from '@/components/search/search-results';
import { Suspense } from 'react';
import { LoadingState } from '@/components/common/loading-state';

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">検索結果</h1>
        {query && (
          <p className="text-muted-foreground">
            「{query}」の検索結果
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検索結果</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchResults query={query} />
        </CardContent>
      </Card>
    </div>
  );
}
