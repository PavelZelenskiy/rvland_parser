import { getHtml } from "./getHtml";

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
    if (info?.includes(selector)) {
      arr.push(info);
    }
  });
  return arr;
};
