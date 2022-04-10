// @ts-check
import {describe,expectEqual} from "./index.js"
import StringUtils from "../base/string.js"
describe("fillString",(parent)=>{
    /**
     * @typedef {Object} fillStringTest
     * @property {string} string
     * @property {number} length
     * @property {string} fill
     * @property {string} expected
     */

    /**@type {fillStringTest[]} */
    const tests = [
        {string:"a",length:1,fill:"b",expected:"a"},
        {string:"b",length:2,fill:" ",expected:" b"},
        {string:"cd",length:1,fill:"-",expected:"cd"},
        {string:"efg",length:10, fill:"_",expected:"_".repeat(7) + "efg"}
    ]
    for (const t of tests) {
        expectEqual(StringUtils.fillString(t.string,t.length,t.fill),t.expected);
    }
})

/**
 * @typedef {Object} mapWordsTest
 * @property {string} string
 * @property {import("../base/string.js").StringModifier} func
 * @property {string} [separator]
 * @property {string} [returnSeparator]
 * @property {string} expected
 */
describe("mapWords",(parent)=>{

    /**@type {mapWordsTest[]} */
    const tests = [
        {string:"a abc abcd",func:(s)=>s.length + "",returnSeparator:"-",expected:"1-3-4"},
        {string:"a_b_c",func:(s)=>s+"!", separator:"_", expected:"a! b! c!"},
        {string:"!b!c",func:(s)=>"a",separator:"!",expected:"a a a"}
    ]
    for (const t of tests) {
        expectEqual(StringUtils.mapWords(t.string,t.func,t.separator,t.returnSeparator),t.expected);
    }
})

describe("wordToTitleCase",(parent)=>{

    /**
     * @typedef {Object} wordToTitleCaseTest
     * @property {string} string
     * @property {string} expected
     */
    /**@type {wordToTitleCaseTest[]} */
    const tests = [
        {string:"",expected:""},
        {string:"abc", expected:"Abc"},
        {string:"!b!c",expected:"!b!c"},
        {string:"aBBBBBBB",expected:"Abbbbbbb"}
        
    ]
    for (const t of tests) {
        expectEqual(StringUtils.wordToTitleCase(t.string),t.expected);
    }
})