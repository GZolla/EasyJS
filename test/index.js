// @ts-check
/* ----------------------------------------------------------------------------------------------------
A very simplified mocha
---------------------------------------------------------------------------------------------------- */

import { BUILD } from "../base/build.js";
import { loadCSS } from "../base/css.js";
import { DOMOptions } from "../base/dom.js";

/**
 * @callback DescribeCallback
 * @param {HTMLElement} parent 
 */

/**
 * Describe a set of test cases
 * @param {string} name 
 * @param {DescribeCallback} callback 
 * @param {HTMLElement} parent
 */
export function describe(name, callback, parent = document.body) {
    loadCSS("testCss","test/index.css")
    const cont = BUILD.element("div","test",DOMOptions.append(parent));
    const contOption = DOMOptions.append(cont);
    const tit = BUILD.element("h2","testTitle",contOption);
    tit.innerHTML = name
    
    const res = BUILD.element("span","testResult",contOption);
    try {
        callback(cont);
        cont.classList.add("succeeded");
        res.innerHTML = "SUCCEEDED"
    } catch (error) {
        cont.classList.add("failed");
        res.innerHTML = "FAILED:" + error.message
    }
}

/**
 * Throw error if actual != expected
 * @template {string | number} T
 * @param {T} actual 
 * @param {T} expected
 */
export function expectEqual(actual, expected) {
    if(actual != expected) {
        throw new Error("Expected " + actual + " to equal " + expected);
    }
}

