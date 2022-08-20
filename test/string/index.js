// @ts-check

import { Carrousel } from "../../addOns/displays/displays.js";
import StringUtils from "../../base/string.js"
import {Test} from "../../addOns/testing/testing.js"

const carrousel = new Carrousel();

const fillStringTest = new Test(StringUtils.fillString,true);
fillStringTest.runTests(
    [ // Inputs
        {input:["b",2," "],expected:" b",id:"normal"},
        {input:["a",1,"b"],expected:"a",id:"filled"},
        {input:["cd",1,"-"],expected:"cd",id:"overfilled"},
        {input:["efg",10,"_"],expected:"_".repeat(7) + "efg",id:"many"},
    ],
    Test.isEqual
).then((v)=>{
    carrousel.add(fillStringTest.displayLastCases());
})






const mapWordsTest = new Test(StringUtils.mapWords,true);
mapWordsTest.runTests(
    [
        {input:["a abc abcd",(s)=>s.length + "",undefined,"-"],expected:"1-3-4"},
        {input:["a_b_c",(s)=>s+"!", "_"],expected:"a! b! c!"},
        {input:["!b!c",(s)=>"a","!"],expected:"a a a"}
    ],
    Test.isEqual
).then((v)=>{
    carrousel.add(mapWordsTest.displayLastCases())
})


const toTitleCaseTest = new Test(StringUtils.wordToTitleCase,true);
toTitleCaseTest.runTests(
    [
        {input:[""],expected:""},
        {input:["abc"],expected:"Abc"},
        {input:["!b!c"],expected:"!b!c"},
        {input:["aBBBBBBB"],expected:"Abbbbbbb"}
    ],
    Test.isEqual
).then((v)=>{
    carrousel.add(toTitleCaseTest.displayLastCases())
})