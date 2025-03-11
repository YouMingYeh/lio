import { BlogPosts } from "@/components/blog/posts";

export const metadata = {
  title: "Lio Blog",
  description: "Lio Blog",
};

export default function Page() {
  return (
    <section className="prose container mt-32">
      <h2 className="dark:prose-invert mb-8 font-semibold tracking-tighter">
        關於我們
      </h2>
      <BlogPosts />
    </section>
  );
}
