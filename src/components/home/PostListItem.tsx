import Link from "next/link";
import Image from "next/image";

interface PostListItemProps {
  title: string;
  category: string;
  excerpt?: string;
  image: string;
  href: string;
  date?: string;
}

export default function PostListItem({
  title,
  category,
  excerpt,
  image,
  href,
  date,
}: PostListItemProps) {
  return (
    <article className="group border-b border-gray-200/80 pb-10 font-sans last:border-0">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-base text-gray-500">
        {date && <time>{date}</time>}
        <span className="text-sky-blue-dark">{category}</span>
      </div>
      <Link href={href}>
        <h3 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-sky-blue-dark">
          {title}
        </h3>
      </Link>
      <Link href={href} className="mt-4 block">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      </Link>
      <div className="mt-4">
        {excerpt && (
          <p className="text-base leading-loose text-gray-800">
            {excerpt}
          </p>
        )}
        <div className="mt-4 flex justify-center">
          <Link
            href={href}
            className="inline-block rounded-sm bg-sky-blue px-4 py-1.5 text-center text-sm font-medium text-white transition hover:bg-sky-blue-dark"
          >
            READ MORE
          </Link>
        </div>
      </div>
    </article>
  );
}
