import { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import Header from "../components/layout/Header";
import content from "../content.json";

const NotFound: NextPage = () => {
  return (
    <>
      <Head>
        <title>Page Not Found &middot; {content.title}</title>
        <meta name="description" content={content.meta.description} />
        <meta name="keywords" content={content.meta.keywords} />
      </Head>

      <div className="container mx-auto my-12 px-6">
        <Header />

        <div className="mt-8">
          <h2 className="font-mono font-bold">Page Not Found</h2>
          <p className="mt-2">
            If you landed here you might be looking for an older post of mine,
            which live on{" "}
            <Link href="https://medium.com/@kaperys" passHref>
              <a
                title="Mike Kaperys on Medium"
                className="underline underline-offset-4 decoration-slate-500 hover:text-slate-500"
              >
                Medium
              </a>
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
