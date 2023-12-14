import axios from "axios";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const defaultValues = {
  noInfo: "информация отсутствует",
  noCampPage: "страница кемпинга не найдена",
};

export const getCampUrls = async (
  url: string,
  maxPaginationPage: number,
  htmlElement: string,
  infoType: string
) => {
  const campUrls: string[] = [];
  let html: string = "";
  for (let i = 1; i <= maxPaginationPage; i++) {
    let pageUrl = url + `/${i}/`;

    try {
      const resp = await axios.get(pageUrl);
      html = resp.data;
    } catch (error) {
      console.log(`страница ${i} списка не найдена`);
      break;
    }

    if (html) {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      document.querySelectorAll(htmlElement).forEach((item) => {
        const attr = item.getAttribute(infoType);
        if (attr) {
          campUrls.push(attr);
        }
      });
    }
  }
  return campUrls;
};

const getHtml = async (url: string) => {
  let html: string = "";

  try {
    const resp = await axios.get(url);
    html = resp.data;
  } catch (error) {
    console.log(defaultValues.noCampPage);
  }

  if (html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    return document;
  } else {
    throw new Error("error");
  }
};

export const getInfo = async (htmlElement: string, url: string) => {
  const document = await getHtml(url);
  const info = document.querySelector(htmlElement)?.textContent;

  if (info) {
    return info.length ? info : defaultValues.noInfo;
  } else {
    return defaultValues.noInfo;
  }
};

export const getInfoBySelector = async (
  htmlElement: string,
  selector: string,
  url: string
) => {
  const document = await getHtml(url);
  let arr: string[] = [];
  const parentElement = document.querySelector(".contacts");

  parentElement?.querySelectorAll(htmlElement).forEach((item) => {
    const info = item.textContent;
    if (info && info.length && info.includes(selector)) {
      arr.push(info);
    }
  });
  return arr;
};

export const getAllInfo = async (
  htmlElement: string,
  infoType: string,
  url: string
) => {
  const document = await getHtml(url);
  const arr: string[] = [];
  document.querySelectorAll(htmlElement).forEach((item) => {
    if (infoType === "photos") {
      const href = item.getAttribute("href");
      return href?.length ? arr.push(href) : defaultValues.noInfo;
    } else {
      const info = item.textContent;
      return info?.length ? arr.push(info) : defaultValues.noInfo;
    }
  });
  return arr;
};
