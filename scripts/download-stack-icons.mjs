import fs from "node:fs/promises";
import vm from "node:vm";

const context = { window: {} };

vm.runInNewContext(
  await fs.readFile("assets/js/content.js", "utf8"),
  context
);

const icons = context.window.PORTFOLIO_DATA.skillIcons;
const directory = "assets/images/stack";

const skillSource =
  "https://raw.githubusercontent.com/tandpfun/skill-icons/main";

const pterodactylSource =
  "https://raw.githubusercontent.com/pterodactyl/panel/develop";

const specialFiles = {
  "Pterodactyl.png":
    pterodactylSource + "/public/favicons/favicon-32x32.png",
  "SKILLICONS-LICENSE.txt":
    skillSource + "/LICENSE",
  "PTERODACTYL-LICENSE.txt":
    pterodactylSource + "/LICENSE.md"
};

await fs.mkdir(directory, { recursive: true });

const files = new Set([
  ...Object.values(icons),
  ...Object.keys(specialFiles)
]);

for (const filename of files) {
  const url = specialFiles[filename]
    || skillSource + "/icons/" + filename;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    throw new Error(
      "Gagal mengambil " + filename + ": HTTP " + response.status
    );
  }

  await fs.writeFile(
    directory + "/" + filename,
    new Uint8Array(await response.arrayBuffer())
  );

  console.log("Tersimpan:", filename);
}