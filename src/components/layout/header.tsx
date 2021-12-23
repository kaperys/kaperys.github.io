import { FC } from "react";
import Link from "next/link";

const Header: FC = () => {
  return (
    <header>
      <h1 className="font-mono font-bold text-xl">Mike Kaperys</h1>
      <div className="mt-4 pb-8 inline-block border-b border-gray-200">
        <p className="text-sm">
          I&rsquo;m a software engineer from Sheffield, United Kingdom.
          I&rsquo;m currently working at{" "}
          <Link href="https://uw.co.uk" passHref>
            <a title="Utility Warehouse">Utility Warehouse</a>
          </Link>{" "}
          building telephony services using Go and Kubernetes.
        </p>

        <nav className="mt-4">
          <ul className="flex space-x-4">
            <NavLink
              title="LinkedIn"
              href="https://uk.linkedin.com/in/mikekaperys"
            />
            <NavLink title="GitHub" href="https://github.com/kaperys" />
            <NavLink title="Twitter" href="https://twitter.com/_kaperys" />
            <NavLink title="Talks" href="https://speakerdeck.com/kaperys" />
          </ul>
        </nav>
      </div>
    </header>
  );
};

const NavLink = ({ title, href }: { title: string; href: string }) => (
  <Link href={href} passHref>
    <a
      title={title}
      className="underline underline-offset-4 decoration-slate-500 hover:text-slate-500"
    >
      <li className="text-sm font-mono">{title}</li>
    </a>
  </Link>
);

export default Header;
