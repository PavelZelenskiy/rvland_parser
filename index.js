const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  //получение camps urls

  let paginationPage = 1;
  let url = `https://rvland.ru/campings/region/all/page/${paginationPage}/`;
  let urlArr = [];

  do {
    await page.goto(url);

    const campUrls = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h2 a"), (el) =>
        el.getAttribute("href")
      );
    });

    urlArr.push(campUrls);

    paginationPage += 1;
    url = `https://rvland.ru/campings/region/all/page/${paginationPage}/`;
  } while (paginationPage <= 3);

  urlArr = urlArr.flat();

  //получение camps info

  const camps = [];

  for (const el of urlArr) {
    await page.goto(el);

    const camp = {};

    camp.title = await page.evaluate(
      () => document.querySelector("h1").innerText
    );
    camp.shortDesc = await page.evaluate(
      () => document.querySelector("div.desc.txt_18_24").innerText
    );
    camp.desc = await page.evaluate(
      () => document.querySelector("div.format_mce").innerText
    );
    camp.photos = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("div.gallery a"), (el) =>
        el.getAttribute("href")
      );
    });
    camp.adress = await page.evaluate(
      () => document.querySelector("div.method span").innerText
    );
    camp.coords = await page.evaluate(
      () => document.querySelector("div.method span.notranslate").innerText
    );
    camp.tel = await page.evaluate(() => {
      for (const a of document.querySelectorAll("a")) {
        if (a.textContent.includes("+7")) {
          return a.textContent;
        }
      }
    });
    camp.web = await page.evaluate(() => {
      for (const a of document.querySelectorAll("span.notranslate a")) {
        if (a.textContent.includes(".ru")) {
          return a.textContent;
        }
      }
    });
    camp.tags = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("div.item"),
        (el) => el.innerText
      );
    });
    camp.reviews = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("div.item_review"),
        (el) => el.innerText
      );
    });

    camps.push(camp);
  }

  fs.writeFileSync("./rvland_parser.json", JSON.stringify(camps), {
    encoding: "utf-8",
  });

  await browser.close();
})();
