import axios from "axios";
import jsdom from "jsdom";
const { JSDOM } = jsdom;
const fs = require("fs");

(async () => {
  //получение camps urls

  let paginationPage = 1;
  let url = `https://rvland.ru/campings/region/all/page/${paginationPage}/`;
  let html: string = "";
  let urlArr = [];

  type Tcamp = {
    title: string;
    shortDesc: string;
    desc: string;
    photos?: (string | null)[];
    address: string;
    coords: string;
    tel?: string;
    web?: string;
    tags?: (string | null)[];
    reviews?: (string | null)[];
  };

  do {
    try {
      const resp = await axios.get(url);
      html = resp.data;
    } catch (error) {
      console.log(error);
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;
    const campUrls: (string | null)[] = [];

    let list = document.querySelectorAll("h2 a");

    list.forEach((node) => {
      campUrls.push(node.getAttribute("href"));
    });

    urlArr.push(campUrls);

    paginationPage += 1;
    url = `https://rvland.ru/campings/region/all/page/${paginationPage}/`;
  } while (paginationPage <= 34);

  urlArr = urlArr.flat();

  //получение camps info

  const camps: Tcamp[] = [];

  for (const url of urlArr) {
    if (url) {
      try {
        const resp = await axios.get(url);
        html = resp.data;
      } catch (error) {
        console.log(error);
      }
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const getInfo = (htmlElement: string) => {
      const info = document.querySelector(htmlElement)?.textContent;
      if (info) {
        return info;
      } else {
        return "информация отсутствует";
      }
    };

    const getAllInfo = (htmlElement: string, attr: string) => {
      const arr: (string | null)[] = [];
      const list = document.querySelectorAll(htmlElement);

      if (attr === "photos") {
        list.forEach((node) => arr.push(node.getAttribute("href")));
        return arr;
      } else if (attr === "tags" || attr === "reviews") {
        list.forEach((node) => arr.push(node.textContent));
        return arr;
      }
    };

    const getInfoByCondition = (htmlElement: string, condition: string) => {
      const list = document.querySelectorAll(htmlElement);
      for (const el of list) {
        if (el.textContent && el.textContent.includes(condition)) {
          return el.textContent;
        }
      }
    };

    const camp: Tcamp = {
      title: getInfo("h1"),
      shortDesc: getInfo("div.desc.txt_18_24"),
      desc: getInfo("div.format_mce"),
      photos: getAllInfo("div.gallery a", "photos"),
      address: getInfo("div.method span"),
      coords: getInfo("div.method span.notranslate"),
      tel: getInfoByCondition("a", "+7"),
      web: getInfoByCondition("span.notranslate a", ".ru"),
      tags: getAllInfo("div.item", "tags"),
      reviews: getAllInfo("div.item_review", "reviews"),
    };

    camps.push(camp);
  }

  fs.writeFileSync("./rvland_parser.json", JSON.stringify(camps), {
    encoding: "utf-8",
  });
})();
