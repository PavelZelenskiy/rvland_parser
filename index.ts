import axios from "axios";
import jsdom from "jsdom";
const { JSDOM } = jsdom;
const fs = require("fs");

const getParser = async () => {
  let maxPaginationPage = 4;
  let html: string | undefined = "";
  let urlArr = [];

  const defaultValues = {
    noInfo: "информация отсутствует",
    noCampPage: "страница кемпинга не найдена",
  };

  type TArrOfStrings = (string | null)[];

  type TCamp = {
    title: string;
    shortDesc: string;
    desc: string;
    photos?: TArrOfStrings;
    address: string;
    coords: string;
    tel?: string;
    web?: string;
    tags?: TArrOfStrings;
    reviews?: TArrOfStrings;
  };

  //получение camps urls

  for (let i = 1; i <= maxPaginationPage; i++) {
    let url = `https://rvland.ru/campings/region/all/page/${i}/`;

    try {
      const resp = await axios.get(url);
      html = resp.data;
    } catch (error) {
      console.log(`страница ${i} списка не найдена`);
      break;
    }

    if (html != undefined) {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const campUrls: (string | null)[] = [];

      let list = document.querySelectorAll("h2 a");

      list.forEach((node) => {
        campUrls.push(node.getAttribute("href"));
      });

      urlArr.push(campUrls);
    }
  }

  urlArr = urlArr.flat();

  //получение camps info

  const camps: TCamp[] = [];

  for (const el of urlArr) {
    if (el) {
      try {
        const resp = await axios.get(el);
        html = resp.data;
      } catch (error) {
        console.log(defaultValues.noCampPage);
        break;
      }
    }

    if (html != undefined) {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const getInfo = (htmlElement: string) => {
        const info = document.querySelector(htmlElement)?.textContent;
        return info || defaultValues.noInfo;
      };

      const getAllInfo = (htmlElement: string, attr: string) => {
        const arr: (string | null)[] = [];
        const list = document.querySelectorAll(htmlElement);

        if (attr === "photos") {
          list.forEach((node) => arr.push(node.getAttribute("href")));
          return arr || defaultValues.noInfo; //всеравно возвращает undefined
        } else if (attr === "tags" || attr === "reviews") {
          list.forEach((node) => arr.push(node.textContent));
          return arr || defaultValues.noInfo; //всеравно возвращает undefined
        }
      };

      const getInfoByCondition = (htmlElement: string, condition: string) => {
        const list = document.querySelectorAll(htmlElement);
        for (const el of list) {
          if (el.textContent && el.textContent.includes(condition)) {
            return el.textContent || defaultValues.noInfo; //всеравно возвращает undefined
          }
        }
      };

      const camp: TCamp = {
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
  }
  console.log(camps);

  fs.writeFileSync("./rvland_parser.json", JSON.stringify(camps), {
    encoding: "utf-8",
  });
};

getParser();
