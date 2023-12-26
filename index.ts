const fs = require("fs");
import { getAllInfo } from "./utils/getAllInfo";
import { getCampUrls } from "./utils/getCampUrls";
import { getInfo } from "./utils/getInfo";
import { getInfoBySelector } from "./utils/getInfoBySelector";
import { InfoTypes } from "./utils/infoTypes";

const getParser = async (url: string) => {
  const maxPaginationPage = 34;

  type TCamp = {
    title: string;
    shortDesc: string;
    desc: string;
    photos: string[];
    address: string;
    coords: string;
    tel: string[];
    web: string[];
    tags: string[];
    reviews: string[];
  };

  //получение camps urls

  const campUrls = await getCampUrls(url, maxPaginationPage, "h2 a", "href");

  //получение camps info

  const camps: TCamp[] = [];

  for (const url of campUrls) {
    const camp: TCamp = {
      title: await getInfo("h1", url),
      shortDesc: await getInfo("div.desc.txt_18_24", url),
      desc: await getInfo("div.format_mce", url),
      photos: await getAllInfo("div.gallery a", InfoTypes.Photos, url),
      address: await getInfo("div.method span", url),
      coords: await getInfo("div.method span.notranslate", url),
      tel: await getInfoBySelector("a", "+7", url),
      web: await getInfoBySelector("span.notranslate a", ".ru", url),
      tags: await getAllInfo("div.item", InfoTypes.Tags, url),
      reviews: await getAllInfo("div.item_review", InfoTypes.Reviews, url),
    };
    camps.push(camp);
  }

  fs.writeFileSync("./rvland_parser.json", JSON.stringify(camps), {
    encoding: "utf-8",
  });
};

const url = "https://rvland.ru/campings/region/all/page";

getParser(url);
