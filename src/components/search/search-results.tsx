'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Bookmark, Share } from 'lucide-react';

interface SearchResultProps {
  query: string;
}

export function SearchResults({ query }: SearchResultProps) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      // Simulate search - in real app, this would call an API
      setLoading(true);
      setTimeout(() => {
        setResults([
          {
            id: '1',
            content: `「${query}」に関連する投稿の例です。これは検索結果のデモンストレーションです。`,
            author: {
              name: 'テストユーザー',
              avatarUrl: 'https://picsum.photos/seed/user1/100/100'
            },
            likes: 42,
            comments: 8,
            timestamp: '2024/01/15 10:30'
          }
        ]);
        setLoading(false);
      }, 1000);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  if (!query) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        検索キーワードを入力してください
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        検索中...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        「{query}」の検索結果が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div key={result.id} className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={result.author.avatarUrl} alt={result.author.name} />
              <AvatarFallback>{result.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{result.author.name}</span>
                <span className="text-sm text-muted-foreground">{result.timestamp}</span>
              </div>
              <p className="mb-3">{result.content}</p>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Heart className="h-4 w-4" />
                  {result.likes}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {result.comments}
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
