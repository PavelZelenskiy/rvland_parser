import { getHtml } from "./getHtml";
import { defaultValues } from "./defaultValues";
import { InfoTypes } from "./infoTypes";

export const getAllInfo = async (
  htmlElement: string,
  infoType: InfoTypes,
  url: string
) => {
  const document = await getHtml(url);
  const arr: string[] = [];
  document.querySelectorAll(htmlElement).forEach((item) => {
    if (infoType === InfoTypes.Photos) {
      const href = item.getAttribute("href");
      return href?.length ? arr.push(href) : defaultValues.noInfo;
    } else {
      const info = item.textContent;
      return info?.length ? arr.push(info) : defaultValues.noInfo;
    }
  });
  return arr;
};
