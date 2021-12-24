export type Post = {
  slug: string;
  date: string;
  title: string;
  meta: {
    description: string;
    keywords: string;
  };
  summary: string;
  content: string;
};
