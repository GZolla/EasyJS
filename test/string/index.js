// @ts-check

import StringUtils from "../../base/string.js"
import Test from "../../addOns/Test.js"

Test.function(
    StringUtils.fillString, 
    Test.buildMultipleChecks(
        /** @type {[string,number,string][]} */([ // Inputs
            ["a",1,"b"],
            ["b",2," "],
            ["cd",1,"-"],
            ["efg",10,"_"]
        ]),
        [ // Expecteds
            "a",
            " b",
            "cd",
            "_".repeat(7) + "efg"
        ]
    ),
    Test.isEqual
)


/**
 * @callback StringModifier
 * @param {string} string Modifying string
 * @returns {string}
 */


Test.function(
    StringUtils.mapWords, 
    Test.buildMultipleChecks(
        /** @type {[string, StringModifier,string?,string?][]} */ ([ // Inputs
            ["a abc abcd",(s)=>s.length + "",undefined,"-"],
            ["a_b_c",(s)=>s+"!", "_"],
            ["!b!c",(s)=>"a","!"]
        ]),
        [ // Expecteds
            "1-3-4",
            "a! b! c!",
            "a a a"
        ]
    ),
    Test.isEqual
)

Test.function(
    StringUtils.wordToTitleCase, 
    Test.buildMultipleChecks(
        /** @type {[string][]} */([ // Inputs
            [""],
            ["abc"],
            ["!b!c"],
            ["aBBBBBBB"]
        ]),
        [ // Expecteds
            "",
            "Abc",
            "!b!c",
            "Abbbbbbb"
        ]
    ),
    Test.isEqual
)