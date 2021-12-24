import fs from "fs";
import path from "path";

async function generate() {
  const pages = [""]; // static pages

  fs.readdirSync(path.join("posts")).forEach((filename) =>
    pages.push(filename.replace(".md", ""))
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages
    .map((page) => {
      return `<url><loc>https://kaperys.io/${page}</loc></url>`;
    })
    .join("")}</urlset>`;

  fs.writeFileSync("public/sitemap.xml", sitemap);
}

generate();
