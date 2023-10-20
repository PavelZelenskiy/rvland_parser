const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://rvland.ru/campings/region/all/");

  let urlArr = await page.evaluate(() => {
    let url = Array.from(document.querySelectorAll("h2 a"), (el) =>
      el.getAttribute("href")
    );
    return url;
  });

  //   console.log(urlArr);

  for (let el of urlArr) {
    await page.goto(el);

    let campSite = new Object();

    campSite.title = await page.evaluate(() => {
      let title = document.querySelector("h1").innerText;
      return title;
    });
    // campSite.shortDesc = await page.evaluate(() => {
    //   let shortDesc = document.querySelector("div.desc.txt_18_24").innerText;
    //   return shortDesc;
    // });
    // campSite.desc = await page.evaluate(() => {
    //   let desc = document.querySelector("div.format_mce").innerText;
    //   return desc;
    // });
    // campSite.photos = await page.evaluate(() => {
    //   let photos = Array.from(
    //     document.querySelectorAll("div.gallery a"),
    //     (el) => el.getAttribute("href")
    //   );
    //   return photos;
    // });
    // campSite.adress = await page.evaluate(() => {
    //   let adress = document.querySelector("div.method span").innerText;
    //   return adress;
    // });
    // campSite.coords = await page.evaluate(() => {
    //   let coords = document.querySelector(
    //     "div.method span.notranslate"
    //   ).innerText;
    //   return coords;
    // });
    campSite.tel = await page.evaluate(() => {
      for (const a of document.querySelectorAll("a")) {
        if (a.textContent.includes("+7")) {
          let tel = a.textContent;
          return tel;
        }
      }
    });
    campSite.email = await page.evaluate(() => {
      for (const a of document.querySelectorAll("span.notranslate a")) {
        if (a.textContent.includes(".ru")) {
          let email = a.textContent;
          return email;
        }
      }
    });

    // campSite.options
    console.log(campSite);
  }

  //   console.log(campSite);

  await browser.close();
})();
