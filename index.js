"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const puppeteer = require("puppeteer");
const fs = require("fs");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer.launch({ headless: false });
    const page = yield browser.newPage();
    //получение camps urls
    let paginationPage = 1;
    let url = `https://rvland.ru/campings/region/all/page/${paginationPage}/`;
    let urlArr = [];
    do {
        yield page.goto(url);
        const campUrls = yield page.evaluate(() => {
            return Array.from(document.querySelectorAll("h2 a"), (el) => el.getAttribute("href"));
        });
        urlArr.push(campUrls);
        paginationPage += 1;
        url = `https://rvland.ru/campings/region/all/page/${paginationPage}/`;
    } while (paginationPage <= 34);
    urlArr = urlArr.flat();
    //получение camps info
    const camps = [];
    for (const el of urlArr) {
        yield page.goto(el);
        const camp = {
            title: yield page.evaluate(() => {
                let element = document.querySelector("h1");
                if (element) {
                    return element.innerText;
                }
            }),
            shortDesc: yield page.evaluate(() => {
                let element = document.querySelector("div.desc.txt_18_24");
                if (element) {
                    return element.innerText;
                }
            }),
            desc: yield page.evaluate(() => {
                let element = document.querySelector("div.format_mce");
                if (element) {
                    return element.innerText;
                }
            }),
            photos: yield page.evaluate(() => {
                return Array.from(document.querySelectorAll("div.gallery a"), (el) => el.getAttribute("href"));
            }),
            adress: yield page.evaluate(() => {
                let element = document.querySelector("div.method span");
                if (element) {
                    return element.innerText;
                }
            }),
            coords: yield page.evaluate(() => {
                let element = document.querySelector("div.method span.notranslate");
                if (element) {
                    return element.innerText;
                }
            }),
            tel: yield page.evaluate(() => {
                for (const a of document.querySelectorAll("a")) {
                    if (a.textContent && a.textContent.includes("+7")) {
                        return a.textContent;
                    }
                }
            }),
            web: yield page.evaluate(() => {
                for (const a of document.querySelectorAll("span.notranslate a")) {
                    if (a.textContent && a.textContent.includes(".ru")) {
                        return a.textContent;
                    }
                }
            }),
            tags: yield page.evaluate(() => {
                const tags = [];
                const elements = Array.from(document.querySelectorAll("div.item"));
                elements.forEach((el) => tags.push(el.innerText));
                return tags;
            }),
            reviews: yield page.evaluate(() => {
                const reviews = [];
                const elements = Array.from(document.querySelectorAll("div.item_review"));
                elements.forEach((el) => reviews.push(el.innerText));
                return reviews;
            }),
        };
        camps.push(camp);
    }
    fs.writeFileSync("./rvland_parser.json", JSON.stringify(camps), {
        encoding: "utf-8",
    });
    yield browser.close();
}))();
