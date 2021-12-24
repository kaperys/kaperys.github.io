import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post } from "../types/post";

const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const WithPost = (slug: string): Post => {
  const { data, content } = matter(
    fs.readFileSync(path.join("posts", slug + ".md"), "utf-8")
  );

  return {
    slug,
    date: data.date.toLocaleDateString("en-GB", dateOptions),
    title: data.title,
    summary: data.summary,
    meta: {
      description: data.metaDescription,
      keywords: data.metaKeywords,
    },
    content,
  };
};

export const WithPosts = (): Post[] => {
  return fs
    .readdirSync(path.join("posts"))
    .map((filename) => {
      return WithPost(filename.replace(".md", ""));
    })
    .reverse();
};
