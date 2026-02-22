import Link from "next/link";
import Image from "next/image";

interface PostGridCardProps {
  title: string;
  excerpt?: string;
  image: string;
  href: string;
}

export default function PostGridCard({
  title,
  excerpt,
  image,
  href,
}: PostGridCardProps) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="block">
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </Link>
      <div className="p-5">
        <Link href={href}>
          <h3 className="text-xl font-bold leading-relaxed text-gray-800 line-clamp-2 hover:text-sky-blue-dark">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p className="mt-2 line-clamp-2 text-base leading-relaxed text-gray-500">
            {excerpt}
          </p>
        )}
        <Link
          href={href}
          className="mt-3 inline-block text-sm font-medium text-sky-blue-dark hover:underline"
        >
          READ MORE
        </Link>
      </div>
    </article>
  );
}
