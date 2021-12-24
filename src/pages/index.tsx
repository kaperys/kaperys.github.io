import { FC, ReactNode } from "react";
import { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import Header from "../components/layout/Header";
import content from "../content/content.json";
import { Post } from "../types/post";
import { WithPosts } from "../content/posts";

type Props = {
  posts: Post[];
  children?: ReactNode;
};

const Home: FC<Props> = ({ posts }) => {
  return (
    <>
      <Head>
        <title>{content.title}</title>
        <link rel="canonical" href="https://kaperys.io" />
        <meta name="description" content={content.meta.description} />
        <meta name="keywords" content={content.meta.keywords} />
      </Head>

      <div className="container mx-auto my-12 px-6">
        <Header />

        <div className="mt-8 flex flex-col space-y-8">
          {posts?.map((post, index) => (
            <article key={index}>
              <Link href={post.slug} passHref>
                <a title={post.title}>
                  <h2 className="font-mono font-bold">{post.title}</h2>
                  <p className="my-2 text-sm line-clamp-4">{post.summary}</p>
                  <p className="text-sm text-slate-500">{post.date}</p>
                </a>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return { props: { posts: WithPosts() } };
};

export default Home;
