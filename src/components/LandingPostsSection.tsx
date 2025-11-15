import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface Post {
  id: number;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  content: string;
  imageUrl?: string;
  imageHint?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
  isBookmarked: boolean;
}

export const LandingPostsSection = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 6;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPosts = async (currentOffset: number, append: boolean = false) => {
    try {
      const response = await fetch(`/api/posts?limit=${limit}&offset=${currentOffset}`);
      if (response.ok) {
        const data = await response.json();
        const newPosts = data.posts || [];
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        if (newPosts.length < limit) {
          setHasMore(false);
        }
      } else {
        console.error('Failed to fetch posts');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(0, false).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          const newOffset = offset + limit;
          setOffset(newOffset);
          fetchPosts(newOffset, true).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, offset]);

  if (loading) {
    return (
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">投稿を読み込み中...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">最新の投稿</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            コミュニティの最新の考えと共有を見てみましょう。
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {posts.map(post => (
            <Card key={post.id}>
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-bold">{post.author.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{post.author.name}</p>
                    <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="mb-4">{post.content}</p>
                {post.imageUrl && (
                  <div className="rounded-lg overflow-hidden border">
                    <Image
                      src={post.imageUrl}
                      alt="投稿画像"
                      width={400}
                      height={300}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
                {post.videoUrl && (
                  <div className="rounded-lg overflow-hidden border">
                    <video
                      src={post.videoUrl}
                      controls
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                  <span>{post.likes} いいね</span>
                  <span>{post.comments} コメント</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {loadingMore && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">もっと読み込み中...</p>
            </div>
          )}
          <div ref={sentinelRef} className="h-4"></div>
        </div>
      </div>
    </section>
  );
};
