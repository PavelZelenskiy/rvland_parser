import axios from "axios";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

import { defaultValues } from "./defaultValues";

export const getHtml = async (url: string) => {
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
