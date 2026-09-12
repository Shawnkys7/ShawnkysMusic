import fs from 'fs';

async function findAudioSource() {
  const layout = await fetch("https://risyadh-musik.vercel.app/_next/static/chunks/app/layout-8b05f354fdda7e80.js").then(r => r.text());
  
  // Search for how music is played
  const reg = /([a-zA-Z0-9_$.]+\.src\s*=[^;]+|new Audio\([^)]*\)|createAudioElement|youtube|piped|googlevideo|saavn|stream|soundcloud|spotify)/gi;
  const matches = layout.match(reg) || [];
  console.log("Audio matches:", matches.slice(0, 20));

  // Let's look for how `videoId` is used in the codebase
  const chunks = [
    "app/layout-8b05f354fdda7e80.js",
    "630-df1749a8164744a9.js",
    "222-3f8ae6bee22f9138.js",
    "924-f8fb289eaac65749.js"
  ];
  for (const c of chunks) {
    const txt = await fetch("https://risyadh-musik.vercel.app/_next/static/chunks/" + c).then(r => r.text());
    const reg2 = /(src\s*:\s*[`"'][^`"']+[`"']|src\s*=\s*[`"'][^`"']+[`"']|audio|Audio|sound|play\()/gi;
    const m = txt.match(reg2);
    if (m) console.log(c, m.slice(0, 15));

    // Look for occurrences of "videoId"
    const v = txt.indexOf("videoId");
    if (v !== -1) {
      console.log(c, "has videoId context:", txt.slice(Math.max(0, v - 100), v + 250));
    }
  }
}
findAudioSource();
