import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreVertical, Music, Send } from "lucide-react";

const reelsData = [
    {
        id: 1,
        user: { name: "クリエイター1", username: "creator_one", avatarUrl: "https://picsum.photos/seed/reel1/80/80" },
        videoUrl: "https://storage.googleapis.com/aifirebase-765b4.appspot.com/users%2F-MEulvX245vybC06AS2a%2Fstudio%2Fm73pwxm1%2Freel-video-1.mp4?alt=media&token=187f54c9-58b7-4c46-976e-d3066f1165a2",
        caption: "ワンネスの心 #平和 #愛",
        audio: "オリジナルオーディオ - クリエイター1",
        likes: "15.2k",
        comments: "288",
        shares: "732"
    },
    {
        id: 2,
        user: { name: "アートの魂", username: "art_soul", avatarUrl: "https://picsum.photos/seed/reel2/80/80" },
        videoUrl: "https://storage.googleapis.com/aifirebase-765b4.appspot.com/users%2F-MEulvX245vybC06AS2a%2Fstudio%2Fm73pwxm1%2Freel-video-2.mp4?alt=media&token=c1110023-e23a-44c1-840a-534a17937965",
        caption: "創造の瞬間 ✨ #アート",
        audio: "オリジナルオーディオ - アートの魂",
        likes: "101k",
        comments: "1.2k",
        shares: "5.5k"
    },
];

export default function ReelsPage() {
  return (
    <div className="h-[calc(100vh-10rem)] bg-black rounded-xl flex justify-center items-center overflow-y-auto snap-y snap-mandatory">
       <div className="w-full max-w-sm h-full flex flex-col snap-start shrink-0" >
        {reelsData.map(reel => <ReelItem key={reel.id} reel={reel} />)}
      </div>
    </div>
  );
}

const ReelItem = ({ reel }: { reel: (typeof reelsData)[0] }) => (
    <div className="relative h-full w-full snap-center shrink-0">
        <video className="h-full w-full object-cover" src={reel.videoUrl} autoPlay loop muted playsInline />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white w-full">
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={reel.user.avatarUrl} alt={reel.user.name} />
                    <AvatarFallback>{reel.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-sm">@{reel.user.username}</p>
                <Button variant="outline" size="sm" className="bg-transparent text-white border-white h-7">フォロー</Button>
            </div>
            <p className="text-sm mt-2">{reel.caption}</p>
            <div className="flex items-center gap-2 mt-2 text-sm">
                <Music className="w-4 h-4" />
                <p>{reel.audio}</p>
            </div>
        </div>
        <div className="absolute bottom-4 right-2 flex flex-col items-center text-white gap-4">
            <button className="flex flex-col items-center gap-1">
                <Heart className="w-7 h-7" />
                <span className="text-xs font-semibold">{reel.likes}</span>
            </button>
            <button className="flex flex-col items-center gap-1">
                <MessageCircle className="w-7 h-7" />
                <span className="text-xs font-semibold">{reel.comments}</span>
            </button>
            <button className="flex flex-col items-center gap-1">
                <Send className="w-7 h-7" />
                 <span className="text-xs font-semibold">{reel.shares}</span>
            </button>
            <button>
                <MoreVertical className="w-7 h-7" />
            </button>
             <Avatar className="h-8 w-8 border-2 border-white mt-2">
                <AvatarImage src={reel.user.avatarUrl} alt={reel.user.name} />
            </Avatar>
        </div>
    </div>
);
