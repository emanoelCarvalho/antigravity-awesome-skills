const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../");
const README_PATH = path.join(ROOT, "README.md");
const SKILLS_DIR = path.join(ROOT, "skills");

function countSkills(dir) {
  let total = 0;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const skillFile = path.join(fullPath, "SKILL.md");

      if (fs.existsSync(skillFile)) {
        total++;
      }

      total += countSkills(fullPath);
    }
  }

  return total;
}

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

function replaceOrFail(content, regex, replacement, label) {
  const next = content.replace(regex, replacement);

  if (next === content) {
    console.warn(`⚠️  Pattern not found: ${label}`);
  }

  return next;
}

if (!fs.existsSync(README_PATH)) {
  console.error("README.md not found");
  process.exit(1);
}

if (!fs.existsSync(SKILLS_DIR)) {
  console.error("/skills directory not found");
  process.exit(1);
}

const count = countSkills(SKILLS_DIR);
const formatted = formatNumber(count);

let readme = fs.readFileSync(README_PATH, "utf8");
readme = replaceOrFail(
  readme,
  /skills=\d+/,
  `skills=${count}`,
  "registry-sync comment"
);

readme = replaceOrFail(
  readme,
  /(# 🌌 Antigravity Awesome Skills:\s*)[\d,]+\+/,
  `$1${formatted}+`,
  "main title"
);
readme = replaceOrFail(
  readme,
  /(Installable GitHub library of )[\d,]+\+/,
  `$1${formatted}+`,
  "subtitle"
);
readme = readme.replace(
  /Browse [\d,]+\+ Skills/g,
  `Browse ${formatted}+ Skills`
);
readme = readme.replace(
  /browse all [\d,]+\+ skills/gi,
  `browse all ${formatted}+ skills`
);

readme = readme.replace(
  /([\s:])[\d,]+\+ skills across/g,
  `$1${formatted}+ skills across`
);

readme = readme.replace(
  /\(#browse-\d+-skills\)/g,
  `(#browse-${count}-skills)`
);

readme = readme.replace(
  /## Browse [\d,]+\+ Skills/g,
  `## Browse ${formatted}+ Skills`
);

fs.writeFileSync(README_PATH, readme);

console.log(`✅ README synced successfully`);
console.log(`📦 Skills detected: ${count}`);
console.log(`📝 README updated: README.md`);