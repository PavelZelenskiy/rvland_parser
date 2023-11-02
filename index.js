const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  let paginationPage = 1;
  let url = `https://rvland.ru/campings/region/all/page/${paginationPage}/`;
  let urlArr = [];

  do {
    await page.goto(url);

    let campUrls = await page.evaluate(() => {
      let campUrl = Array.from(document.querySelectorAll("h2 a"), (el) =>
        el.getAttribute("href")
      );
      return campUrl;
    });

    urlArr.push(campUrls);

    paginationPage = paginationPage + 1;
    url = `https://rvland.ru/campings/region/all/page/${paginationPage}/`;
  } while (paginationPage <= 34);

  urlArr = urlArr.flat();

  //   console.log(urlArr.length);

  let camps = [];

  for (let el of urlArr) {
    await page.goto(el);

    let camp = new Object();

    camp.title = await page.evaluate(() => {
      let title = document.querySelector("h1").innerText;
      return title;
    });
    camp.shortDesc = await page.evaluate(() => {
      let shortDesc = document.querySelector("div.desc.txt_18_24").innerText;
      return shortDesc;
    });
    camp.desc = await page.evaluate(() => {
      let desc = document.querySelector("div.format_mce").innerText;
      return desc;
    });
    camp.photos = await page.evaluate(() => {
      let photos = Array.from(
        document.querySelectorAll("div.gallery a"),
        (el) => el.getAttribute("href")
      );
      return photos;
    });
    camp.adress = await page.evaluate(() => {
      let adress = document.querySelector("div.method span").innerText;
      return adress;
    });
    camp.coords = await page.evaluate(() => {
      let coords = document.querySelector(
        "div.method span.notranslate"
      ).innerText;
      return coords;
    });
    camp.tel = await page.evaluate(() => {
      for (const a of document.querySelectorAll("a")) {
        if (a.textContent.includes("+7")) {
          let tel = a.textContent;
          return tel;
        }
      }
    });
    camp.web = await page.evaluate(() => {
      for (const a of document.querySelectorAll("span.notranslate a")) {
        if (a.textContent.includes(".ru")) {
          let web = a.textContent;
          return web;
        }
      }
    });
    camp.tags = await page.evaluate(() => {
      let tags = Array.from(
        document.querySelectorAll("div.item"),
        (el) => el.innerText
      );
      return tags;
    });
    camp.reviews = await page.evaluate(() => {
      let reviews = Array.from(
        document.querySelectorAll("div.item_review"),
        (el) => el.innerText
      );
      return reviews;
    });

    camps.push(camp);
  }

  //   console.log(camps.length);

  fs.writeFileSync("./rvland_parser.json", JSON.stringify(camps), {
    encoding: "utf-8",
  });

  await browser.close();
})();
