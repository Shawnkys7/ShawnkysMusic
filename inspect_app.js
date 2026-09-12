import fs from 'fs';

async function checkSite() {
  try {
    const urls = [
      "https://risyadh-musik.vercel.app/",
      "https://risyadh-musik.vercel.app/_next/static/chunks/app/layout-8b05f354fdda7e80.js",
      "https://risyadh-musik.vercel.app/_next/static/chunks/app/page-f22efab04b2937d8.js",
      "https://risyadh-musik.vercel.app/_next/static/chunks/630-df1749a8164744a9.js",
      "https://risyadh-musik.vercel.app/_next/static/chunks/222-3f8ae6bee22f9138.js"
    ];

    for (const u of urls) {
      console.log("\n==================================");
      console.log("FETCHING:", u);
      const res = await fetch(u);
      const text = await res.text();
      console.log("Length:", text.length);

      const routes = text.match(/\/(search|library|developer|playlist|artist|album|queue|lyrics|api\/[a-zA-Z0-9_\-\/]+)/g);
      if (routes) console.log("Routes:", [...new Set(routes)]);

      const apiMatches = text.match(/https?:\/\/[a-zA-Z0-9.\-_:\/]+/g) || [];
      const cleanApis = [...new Set(apiMatches)].filter(a => !a.includes("w3.org") && !a.includes("vercel.app") && !a.includes("schema.org"));
      if (cleanApis.length) console.log("External APIs/Domains:", cleanApis.slice(0, 10));

      const texts = text.match(/>([^<>{}\n]{3,60})</g);
      if (texts) {
        console.log("Sample DOM text:", [...new Set(texts.map(t => t.slice(1, -1).trim()))].slice(0, 20));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

checkSite();
