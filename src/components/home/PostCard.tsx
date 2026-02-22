import Link from "next/link";
import Image from "next/image";

interface PostCardProps {
  title: string;
  category: string;
  image: string;
  href: string;
}

export default function PostCard({ title, category, image, href }: PostCardProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-rose-600 backdrop-blur-sm">
          {category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-rose-600 transition-colors">
          {title}
        </h3>
      </div>
    </Link>
  );
}
