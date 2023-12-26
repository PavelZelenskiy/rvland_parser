import axios from "axios";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

export const getCampUrls = async (
  url: string,
  maxPaginationPage: number,
  htmlElement: string,
  infoType: string
) => {
  const campUrls: string[] = [];
  let html: string = "";
  for (let i = 1; i <= maxPaginationPage; i++) {
    let pageUrl = `${url}/${i}/`;

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
