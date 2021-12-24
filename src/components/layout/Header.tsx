import { FC } from "react";
import Link from "next/link";
import content from "../../content/content.json";

const Header: FC = () => {
  return (
    <header>
      <h1 className="font-mono font-bold text-xl">{content.title}</h1>
      <div className="mt-4 pb-8 inline-block border-b border-gray-200">
        <p className="text-sm">{content.intro}</p>

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
