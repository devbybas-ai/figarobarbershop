"use client";

import { useEffect, useState } from "react";

interface InstagramPost {
  id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  caption?: string;
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => r.json())
      .then((data: { data: InstagramPost[]; configured: boolean }) => {
        setPosts(data.data);
        setConfigured(data.configured);
      })
      .catch(() => setPosts([]));
  }, []);

  if (!configured || posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-figaro-cream py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-figaro-black sm:text-4xl">
            Follow Us
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-figaro-gold" />
          <p className="mt-4 text-figaro-black/60">
            <a
              href="https://www.instagram.com/figaroleucadia/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-figaro-gold"
            >
              @figaroleucadia
            </a>{" "}
            on Instagram
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-sm bg-figaro-black/5"
            >
              {post.media_type === "VIDEO" ? (
                <div className="flex h-full items-center justify-center bg-figaro-dark/10">
                  <svg
                    className="h-10 w-10 text-figaro-gold"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              ) : (
                <img
                  src={post.media_url}
                  alt={post.caption?.slice(0, 100) ?? "Instagram post from Figaro Barbershop"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-figaro-dark/0 transition-colors group-hover:bg-figaro-dark/30" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
