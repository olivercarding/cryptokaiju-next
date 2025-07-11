import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/image'

interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  mainImage: any
  publishedAt: string
  author: { name: string }
}

async function getBlogPosts(): Promise<BlogPost[]> {
  return client.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      mainImage,
      publishedAt,
      author->{ name }
    }
  `)
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-kaiju-navy mb-4">
          CryptoKaiju Blog
        </h1>
        <p className="text-xl text-kaiju-mid-gray">
          Latest news, updates, and stories from the Kaiju universe
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {post.mainImage && (
              <Image
                src={urlForImage(post.mainImage)}
                alt={post.title}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-xl font-bold text-kaiju-navy mb-2">
                <Link href={`/blog/${post.slug.current}`} className="hover:text-kaiju-pink">
                  {post.title}
                </Link>
              </h2>
              <p className="text-kaiju-mid-gray mb-4">{post.excerpt}</p>
              <div className="flex justify-between items-center text-sm text-kaiju-mid-gray">
                <span>By {post.author.name}</span>
                <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}