import { FC, ReactNode } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import ReactMarkdown from "react-markdown";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Head from "next/head";
import content from "../content.json";
import { Post } from "../types/post";

type Props = {
  post: Post;
  children?: ReactNode;
};

const Post: FC<Props> = ({ post }) => {
  return (
    <>
      <Head>
        <title>
          {post.title} &middot; {content.title}
        </title>
        <link rel="canonical" href={"https://kaperys.io/" + post.slug} />
        <meta name="description" content={post.meta?.description} />
        <meta name="keywords" content={post.meta?.keywords} />
      </Head>

      <div className="container mx-auto my-12 px-6">
        <div className="prose prose-slate max-w-none prose-headings:font-mono">
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
          <ReactMarkdown>{post.content || ""}</ReactMarkdown>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const slug =
    typeof context.params?.post == "string" ? context.params.post : "";

  const { data, content } = matter(
    fs.readFileSync(path.join("posts", slug + ".md"), "utf-8")
  );

  return {
    props: {
      post: {
        slug,
        date: data.date.toLocaleString(),
        title: data.title,
        summary: data.summary,
        meta: {
          description: data.metaDescription,
          keywords: data.metaKeywords,
        },
        content,
      },
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join("posts"));

  return {
    paths: files.map((filename) => ({
      params: { post: filename.replace(".md", "") },
    })),
    fallback: false,
  };
};

export default Post;
