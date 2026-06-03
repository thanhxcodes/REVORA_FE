import { Heart, MessageCircle, Share2, Play } from 'lucide-react';

interface VideoCardProps {
  thumbnail: string;
  title: string;
  price: number;
  seller: string;
  likes: number;
}

export default function VideoCard({ thumbnail, title, price, seller, likes }: VideoCardProps) {
  return (
    <div className="relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Video Thumbnail */}
      <div className="relative aspect-[9/16] bg-gray-100 overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-medium mb-1 line-clamp-2">{title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{price.toLocaleString('vi-VN')}đ</span>
            <span className="text-sm opacity-90">@{seller}</span>
          </div>
        </div>

        {/* Side Actions */}
        <div className="absolute right-3 bottom-20 flex flex-col space-y-4">
          <button className="flex flex-col items-center text-white">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mb-1">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs">{likes}</span>
          </button>
          <button className="flex flex-col items-center text-white">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mb-1">
              <MessageCircle className="w-5 h-5" />
            </div>
          </button>
          <button className="flex flex-col items-center text-white">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mb-1">
              <Share2 className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
