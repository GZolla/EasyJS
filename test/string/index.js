// @ts-check

import StringUtils from "../../base/string.js"
import Test from "../index.js"

Test.function(StringUtils.fillString,
    [ // Inputs
        ["a",1,"b"],
        ["b",2," "],
        ["cd",1,"-"],
        ["efg",10,"_"]
    ],
    [ // Expecteds
        "a",
        " b",
        "cd",
        "_".repeat(7) + "efg"
    ],
    Test.isEqual
)


Test.function(StringUtils.fillString,
    [ // Inputs
        ["a",1,"b"],
        ["b",2," "],
        ["cd",1,"-"],
        ["efg",10,"_"]
    ],
    [ // Expecteds
        "a",
        " b",
        "cd",
        "_".repeat(7) + "efg"
    ],
    Test.isEqual
)

/**
 * @callback StringModifier
 * @param {string} string Modifying string
 * @returns {string}
 */

/** @type {[string, StringModifier,string?,string?][]} */
const mapWordsInput = [ // Inputs
    ["a abc abcd",(s)=>s.length + "",undefined,"-"],
    ["a_b_c",(s)=>s+"!", "_"],
    ["!b!c",(s)=>"a","!"]
]

Test.function(StringUtils.mapWords, 
    mapWordsInput,
    [ // Expecteds
        "1-3-4",
        "a! b! c!",
        "a a a"
    ],
    Test.isEqual
)

Test.function(StringUtils.wordToTitleCase, 
    [ // Inputs
        [""],
        ["abc"],
        ["!b!c"],
        ["aBBBBBBB"]
    ],
    [ // Expecteds
        [""],
        ["Abc"],
        ["!b!c"],
        ["Abbbbbbb"]
    ],
    Test.isEqual
)