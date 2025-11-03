import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";

// Mock data for the discover grid
const discoverPosts = Array.from({ length: 21 }, (_, i) => ({
  id: i + 1,
  imageUrl: `https://picsum.photos/seed/discover${i + 1}/500/500`,
  imageHint: "discover content",
  likes: Math.floor(Math.random() * 2000),
  comments: Math.floor(Math.random() * 200),
}));

export default function DiscoverPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">発見</h1>
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {discoverPosts.map((post) => (
          <div key={post.id} className="aspect-square relative group cursor-pointer">
            <Image
              src={post.imageUrl}
              alt={`Discover post ${post.id}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={post.imageHint}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                <span>{post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
