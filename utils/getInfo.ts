import { getHtml } from "./getHtml";
import { defaultValues } from "./defaultValues";

export const getInfo = async (htmlElement: string, url: string) => {
  const document = await getHtml(url);
  const info = document.querySelector(htmlElement)?.textContent;

  return info?.length ? info : defaultValues.noInfo;
};
