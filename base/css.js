//@ts-check
import { STATIC_PATH } from "../settings.js";

/**
 * CSS helper functions
 * @module CSS
 */

/* ----------------------------------------------------------------------------------------------------
Settings
---------------------------------------------------------------------------------------------------- */

/**
 * @type {UnitValue}
 */
const MIN_PADDING =  {value:.2, unit:"em"};


/* ----------------------------------------------------------------------------------------------------
Units
---------------------------------------------------------------------------------------------------- */

/**
 * CSS Absolute units
 * @typedef {("cm" | "mm" | "in" | "px" | "pt" | "pc")} CSSAbsoluteUnit
 */

/**
 * CSS Font-relative units
 * @typedef {("em" | "ex" | "ch" | "rem")} CSSFontUnit
 */

/**
 * CSS unit
 * @typedef {(CSSAbsoluteUnit | CSSFontUnit | "vw" | "vh" | "vmin" | "vmax" | "%")} CSSUnit
 */

/**
 * Object describing a number of units
 * @typedef {Object} UnitValue
 * @property {number} value
 * @property {CSSUnit} unit
 */

/**
 * Convert unit value to pixels
 * @param {UnitValue} unitValue 
 * @param {HTMLElement} element
 * @param {boolean} isHeight
 * @returns {number} The number of pixels equal to unitValue 
 */
 function unitValueToPixels(unitValue, element, isHeight = false) {
    return unitValue.value * getUnitConversion(unitValue.unit, element, isHeight);
}


/**
 * Get conversion from unit to pixels
 * @param {CSSUnit} unit 
 * @param {HTMLElement} element Element where unit applies
 * @param {boolean} isHeight Wether % refers to height
 * @returns {number}
 */
function getUnitConversion(unit, element, isHeight = false) {
    switch (unit) {
        case "cm":
        case "mm":
        case "in":
        case "px":
        case "pt":
        case "pc":
            return AbsoluteInPixels[unit];
        case "ex":
        case "ch":
            console.log("%c Converting 'ex' or 'ch' to pixels is unreliable, consider other values","background-color:yellow");
        case "em":
            return getFontSize(element) * getFontSizeMultiplier(unit);
        case "rem":
            return getFontSize(document.body);
        default:
            const h = unit == "%" ? element.offsetHeight : window.innerHeight;
            const w = unit == "%" ? element.offsetWidth : window.innerWidth;
            return (unit == "vh" || (unit == "vmin" && h < w) || (unit == "vmax" && h > w) || (unit == "%" && isHeight)  ? h:w) / 100;
    }
}

/**
 * Returns the computed fontsize of element in pixels
 * @param {Element} element 
 * @return {number}
 */
function getFontSize(element) {
    return parseFloat(window.getComputedStyle(element, null).getPropertyValue('font-size'));
}

/**
 * Get the multiplier from font size to unit
 * @param {CSSFontUnit} unit 
 * @returns {number}
 */
function getFontSizeMultiplier(unit) {
    if(unit == "ch") return 5/8;
    if(unit == "ex") return .5;
    return 1;
}


/* ----------------------------------------------------------------------------------------------------
Conversions units in pixels
---------------------------------------------------------------------------------------------------- */

/**
 * @type {Object.<CSSAbsoluteUnit,number>}
 * @readonly
 */
const AbsoluteInPixels = {
    px: 1,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 2540,
    pt: 4 / 3,
    pc: 16
}



/* ----------------------------------------------------------------------------------------------------
Loader
---------------------------------------------------------------------------------------------------- */

/**
 * Load css from path, assigningit a unique id, fails if element with id exists
 * @param {string} id Unique id of the stylesheet
 * @param {string} path path from EasyJs container to css
 * @param {boolean} force Delete item with id if it exists
 */
 export function loadCSS(id, path, force = false) {
    const prev = document.getElementById(id); 
    if (force || !prev)
    {
        if(prev && prev.parentElement) prev.parentElement.removeChild(prev);
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.id   = id;
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = STATIC_PATH + path;
        link.media = 'all';
        head.appendChild(link);
    }
}

/* ----------------------------------------------------------------------------------------------------
Positioning
---------------------------------------------------------------------------------------------------- */

/**
 * Postion on canvas, negatives represent right/bottom distance
 * @typedef {Object} Coordinate
 * @property {number} x
 * @property {number} y
 */

/**
 * Get position when prevention overflow on a container
 * @param {HTMLElement} element
 * @param {number} position
 * @param {boolean} preventOverflow
 * @param {boolean} isHorizontal 
 */
function getPositionOffset(element, position, preventOverflow, isHorizontal = true) {
    if(!preventOverflow) return position;

    const [size, containerSize] = isHorizontal ? [element.offsetWidth, window.innerWidth]
                                            : [element.offsetHeight, window.innerHeight]

    const min_padding = unitValueToPixels(MIN_PADDING,element, !isHorizontal);
    if (size > containerSize - 2 * min_padding) return min_padding; // position at 0 if overflow cannot be prevented
    const spaceBefore = min_padding + size <= position;
    const spaceAfter = position + size <= containerSize - min_padding

    if (isHorizontal ? spaceAfter : !spaceBefore) return position; // position normally if element fits container at position
    if (spaceBefore) return position - containerSize; // place before position if that prevents overflow
    return containerSize - min_padding - size; // otherwise place at bottom
}

/**
 * Position element fixed on viewport
 * @param {HTMLElement} element Element to position
 * @param {Coordinate} coordinate Coordinate to position in
 * @param {boolean} isLeft If element's left side is being positioned(as opposed to right)
 * @param {boolean} isTop If element's top side is being positioned(as opposed to bottom)
 * @param {CSSUnit} unit Unit for coordinates
 */
export function positionOnViewport(element, coordinate, isLeft, isTop, unit = "px", ) {
    document.body.appendChild(element);
    
    element.style.position = "fixed";
    element.style[isLeft ? "left" : "right"] = coordinate.x + unit;
    element.style[isTop ? "top" : "bottom" ] = coordinate.y + unit;
}

/**
 * Position corner of element on mouse
 * @param {Object} data
 * @param {HTMLElement} data.element Element to position
 * @param {boolean} [data.preventOverflow = false]  Shift position if the object would overflow
 * @param {MouseEvent} e 
 */
export function positionOnMouse({element, preventOverflow = false}, e) {
    document.body.appendChild(element);
    const x = getPositionOffset(element, e.clientX + e.movementX, preventOverflow);
    const y = getPositionOffset(element, e.clientY + e.movementY, preventOverflow, false);
    const coordinate = {
        x: Math.abs(x),
        y: Math.abs(y)
    }

    positionOnViewport(element, coordinate, x>=0, y>=0);
}

/**
 * Position element relative to reference element, offsets will be relative to reference element
 * @param {HTMLElement} referenceElement Reference for positioning: will be relative positioned if static
 * @param {HTMLElement} element Element to position
 * @param {UnitValue} xOffset  Offset in x
 * @param {UnitValue} yOffset  Offset in y
 * @param {boolean} isLeft If element's left side is being positioned(as opposed to right)
 * @param {boolean} isTop If element's top side is being positioned(as opposed to bottom)
 */
export function positionRelativeOffset(referenceElement, element, xOffset, yOffset, isLeft, isTop) {
    if(window.getComputedStyle(referenceElement, null).getPropertyValue('position') == "static") {
        referenceElement.style.position = "relative";
    }
    element.style.position = "absolute";

    element.style[isLeft ? "left" : "right"] = unitValueToPixels(xOffset,referenceElement) + "px";
    element.style[isTop ? "top" : "bottom" ] = unitValueToPixels(yOffset,referenceElement,true) + "px";
}

/**
 * Postion element relative to reference element
 * @param {HTMLElement} referenceElement Reference for positioning
 * @param {HTMLElement} element Element to position
 * @param {("above" | "below" | "right" | "left" | "center")} position
 */
export function positionRelative(referenceElement, element, position) {
    const widthDifference = (referenceElement.offsetWidth - element.offsetWidth) / 2;
    const heightDifference = (referenceElement.offsetHeight - element.offsetHeight) / 2;

    positionRelativeOffset(
        referenceElement,
        element,
        position!="right" && position != "left" ? {value: widthDifference,unit:"px"} : {value:100, unit:"%"}, 
        position != "above" && position != "below" ? {value: heightDifference,unit:"px"} : {value:100, unit:"%"},
        position != "right",position != "below"
    )
}