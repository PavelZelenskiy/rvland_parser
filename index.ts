const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  //получение camps urls

  let paginationPage = 1;
  let url = `https://rvland.ru/campings/region/all/page/${paginationPage}/`;
  let urlArr: string[] = [];

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
  } while (paginationPage <= 34);

  urlArr = urlArr.flat();

  //получение camps info

  const camps: object[] = [];

  for (const el of urlArr) {
    await page.goto(el);

    const camp: {
      title: string;
      shortDesc: string;
      desc: string;
      photos: string[];
      adress: string;
      coords: string;
      tel?: string;
      web?: string;
      tags: string[];
      reviews?: string[];
    } = {
      title: await page.evaluate(() => {
        let element = document.querySelector("h1") as HTMLHeadingElement;
        if (element) {
          return element.innerText;
        }
      }),
      shortDesc: await page.evaluate(() => {
        let element = document.querySelector(
          "div.desc.txt_18_24"
        ) as HTMLBodyElement;
        if (element) {
          return element.innerText;
        }
      }),
      desc: await page.evaluate(() => {
        let element = document.querySelector(
          "div.format_mce"
        ) as HTMLBodyElement;
        if (element) {
          return element.innerText;
        }
      }),
      photos: await page.evaluate(() => {
        return Array.from(document.querySelectorAll("div.gallery a"), (el) =>
          el.getAttribute("href")
        );
      }),
      adress: await page.evaluate(() => {
        let element = document.querySelector(
          "div.method span"
        ) as HTMLBodyElement;
        if (element) {
          return element.innerText;
        }
      }),
      coords: await page.evaluate(() => {
        let element = document.querySelector(
          "div.method span.notranslate"
        ) as HTMLBodyElement;
        if (element) {
          return element.innerText;
        }
      }),
      tel: await page.evaluate(() => {
        for (const a of document.querySelectorAll("a")) {
          if (a.textContent && a.textContent.includes("+7")) {
            return a.textContent;
          }
        }
      }),
      web: await page.evaluate(() => {
        for (const a of document.querySelectorAll("span.notranslate a")) {
          if (a.textContent && a.textContent.includes(".ru")) {
            return a.textContent;
          }
        }
      }),
      tags: await page.evaluate(() => {
        const tags: string[] = [];
        const elements = Array.from(
          document.querySelectorAll("div.item")
        ) as HTMLElement[];
        elements.forEach((el) => tags.push(el.innerText));
        return tags;
      }),
      reviews: await page.evaluate(() => {
        const reviews: string[] = [];
        const elements = Array.from(
          document.querySelectorAll("div.item_review")
        ) as HTMLElement[];
        elements.forEach((el) => reviews.push(el.innerText));
        return reviews;
      }),
    };

    camps.push(camp);
  }

  fs.writeFileSync("./rvland_parser.json", JSON.stringify(camps), {
    encoding: "utf-8",
  });

  await browser.close();
})();
