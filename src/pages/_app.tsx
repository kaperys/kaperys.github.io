import type { AppProps } from 'next/app';
import Head from 'next/head';
import { New_Rocker, Tomorrow } from 'next/font/google';
import './globals.css';

const newRocker = New_Rocker({
  variable: '--font-new-rocker',
  subsets: ['latin'],
  weight: '400',
});

const tomorrow = Tomorrow({
  variable: '--font-tomorrow',
  subsets: ['latin'],
  weight: '400',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Mike Kaperys</title>
        <meta name="description" content="I build high-performing software engineering teams." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${newRocker.variable} ${tomorrow.variable} antialiased p-8`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}