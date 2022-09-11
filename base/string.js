// @ts-check

/**
 * Utility classes to handle strings
 * @module StringUtilities
 */

/**
 * @callback StringModifier
 * @param {string} string Modifying string
 * @returns {string}
 */

/**
 * Split the string into words by separator, applies func to each and returns all words separated by returnSeparator
 * @param {string} string 
 * @param {string} separator
 * @param {StringModifier} func
 * @param {string} returnSeparator
 * @returns {string}
 */
export function mapWords(string, func,separator=" ", returnSeparator = " ") {
    const words = string.split(separator).map(func);
    return words.join(returnSeparator);
}

/**
 * Changes the first letter to uppercase and the rest to lowercase
 * @param {string} string 
 * @returns {string}
 */
export function wordToTitleCase(string) {
    return string.substring(0,1).toUpperCase() + string.substring(1).toLowerCase()
}


/**
 * Converts a string to Title Case, using separator to split words
 * @param {string} string 
 * @param {string} separator 
 * @returns {string}
 */
export function toTitleCase(string,separator = " ") {
    return mapWords(string,wordToTitleCase,separator)
}

/**
 * Fill the string by placing fill on the left to get desired length
 * @param {string} string 
 * @param {number} length 
 * @param {string} fill 
 */
export function fillString(string, length, fill) {
    if(length <= string.length) return string;
    return fill.repeat(length - string.length) + string;
}


/**
 * Convert any into an html safe string
 * @param {*} str 
 * @returns {string}
 */
export function htmlSafe(str) {
    if (typeof str !== 'string') str = String(str);
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}