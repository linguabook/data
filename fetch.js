const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const pSeries = require("p-series");
const { fetchData, ogden, dolch } = require("lingua-scraper");

async function main() {
  const a1 = _.flatMap(ogden.categories, (t) => t.words);
  const a2 = _.flatMap(dolch.categories, (t) => t.words);
  const words = _.uniq(a1.concat(a2).map((t) => t.text));
  const outDir = path.resolve(__dirname, "words");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  // generate json file for each word
  const tasks = words.map((text) => async () => {
    let data;
    try {
      console.log(`proc ${text}`);
      data = await fetchData({ text });
      await delay(250);
    } catch (err) {
      console.log(`fetch '${text}' fail:`, err);
      data = {};
    }
    const dest = path.resolve(outDir, `${text.toLowerCase()}.json`);
    await fs.promises.writeFile(
      dest,
      JSON.stringify(data, null, "  "),
      "utf-8"
    );
  });
  await pSeries(_.take(tasks, 10000));
  process.exit();
}

function delay(timeout) {
  return new Promise((resolve) => setTimeout(() => resolve(true), timeout));
}

main().catch(console.error);
