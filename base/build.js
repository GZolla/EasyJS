// @ts-check
import { DOMOptions,DOMOption } from "./dom.js";


/**
 * HTML element builders
 * @module Build
 */

/* ----------------------------------------------------------------------------------------------------
Type Definitions
---------------------------------------------------------------------------------------------------- */
/**
 * @typedef {( "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week" )} InputType
 */

/**
 * @typedef {"animationcancel" | "animationend" | "animationiteration" | "animationstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart"} AnimationEventName
 */

/**
 * @typedef {"click" | "dblclick" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "wheel"  | "contextmenu" | "auxclick"  | "selectionchange" | "selectstart"} MouseEventName
 */

/**
 * @typedef {"pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "gotpointercapture" | "lostpointercapture"} PointerEventName
 */

/**
 * @typedef {"drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "scroll"} DragEventName
 */

/**
 * @typedef {"copy" | "cut" | "paste"} ClipdboardEventName
 */

/**
 * @typedef {"keydown" | "keypress" | "keyup"} KeyboardEventName
 */

/**
 * @typedef {"blur" | "change" | "focus" | "input" | "invalid" | "reset" | "search" | "select" | "submit"  | "focusin" | "focusout"} FormEventName
 */
/**
 * @typedef {"touchcancel" | "touchend" | "touchmove" | "touchstart"} TouchEventName
 */
/**
 * @typedef {"canplay" | "canplaythrough" | "cuechange" | "durationchange" | "emptied" | "ended" | "loadeddata" | "loadedmetadata" | "loadstart" | "pause" | "play" | "playing" | "progress" | "ratechange" | "seeked" | "seeking" | "stalled" | "suspend" | "timeupdate" | "volumechange" | "waiting"} MediaEventName
 */
/**
 * @typedef {"abort" | "load" | "error" | "loadend"} XMLHTTPEventName
 */
/**
 * @typedef {"cancel" | "close" | "toggle"} DialogEventName
 */
/**
 * @typedef {"resize" | "fullscreenchange" | "fullscreenerror"} WindowEventName
 */


/**
 * @typedef {AnimationEventName | MouseEventName |PointerEventName |ClipdboardEventName | KeyboardEventName | FormEventName | TouchEventName | MediaEventName | XMLHTTPEventName | DialogEventName | WindowEventName} EventName
 */





/**
 * Event handling callback
 * @callback eventCallback
 * @param {HTMLElement} this
 * @param {Event} ev
 */


/**
 * Event handling function and event name
 * @typedef {Object} EventHandler
 * @property {EventName} event
 * @property {eventCallback} handler
 */


/**
 * @typedef {"base" | "head" | "link" | "meta" | "style" | "title"} MetadataTag
 */
/**
 * @typedef {"h1" | "h2" | "h3" | "h4" | "h5" | "h6"} HeaderTag
 */
/**
 * @typedef {"blockquote" | "dd" | "div" | "dl" | "dt" | "figcaption" | "figure" | "hr" | "li" | "menu" | "ol" | "p" | "pre" | "ul"} ContentTag
 */
/**
 * @typedef {"body" | "address" | "article" | "aside" | "footer" | "header" | "main" | "nav" | "section"} SectioningTag
 */
/**
 * @typedef {"a" | "abbr" | "b" | "bdi" | "bdo" | "br" | "cite" | "code" | "data" | "dfn" | "em" | "i" | "kbd" | "mark" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "small" | "span" | "strong" | "sub" | "sup" | "time" | "u" | "var" | "wbr"} InlineTag
 */
/**
 * @typedef {"area" | "audio" | "img" | "map" | "track" | "video" | "picture" | "source"} MultiMediaTag
 */
/**
 * @typedef {"embed" | "iframe" | "object" | "portal"} EmbeddingTag
 */

/**
 * @typedef {"canvas" | "noscript" | "script"} ScriptingTag
 */
/**
 * @typedef {"del" | "ins"} EditTag
 */
/**
 * @typedef {"caption" | "col" | "colgroup" | "table" | "tbody" | "td" | "tfoot" | "th" | "thead" | "tr"} TableTag
 */
/**
 * @typedef {"button" | "datalist" | "fieldset" | "form" | "input" | "label" | "legend" | "meter" | "optgroup" | "option" | "output" | "progress" | "select" | "textarea"} FormTag
 */
/**
 * @typedef {"details" | "dialog" | "summary" | "slot" | "template"} UtilityTag
 */

/**
 * @typedef {MetadataTag | SectioningTag | HeaderTag | ContentTag | InlineTag | MultiMediaTag | EmbeddingTag | ScriptingTag | EditTag | TableTag | FormTag | UtilityTag} HTMLElementTag
 */


/**
 * Creates an element of the given tag
 * @param {HTMLElementTag} tag 
 * @param {string} className 
 * @param {DOMOption} [option] 
 * @return {HTMLElement}
 */
export function element(tag, className = "", option) {
    const element = document.createElement(tag);
    element.className = className;
    if(option != null) option.apply(element);
    return element;
}

/* ----------------------------------------------------------------------------------------------------
Common elements
---------------------------------------------------------------------------------------------------- */

/**
 * Creates an img element with given src
 * @param {string} src 
 * @param {string} alt 
 * @param {string} className 
 * @param {DOMOption} [option] 
 * @returns {HTMLImageElement}
 */
export function img(src, alt, className = "",option) {
    const img =/**@type {HTMLImageElement}*/ (element("img",className,option));
    img.src = src;
    img.alt = alt;
    return img
}

/**
 * Creates an img element with given src
 * @param {URL | string} href
 * @param {string} className 
 * @param {DOMOption} [option] 
 * @return {HTMLAnchorElement}
 */
export function a(href,className="",option) {
    const a = /**@type {HTMLAnchorElement} */ (element("a",className,option))
    a.href = typeof href == "string" ? href : href.href;
    return a
}

/**
 * Create a text node
 * @param {string} text 
 * @param {DOMOption} [option] 
 * @return {Text}
 */
export function textNode(text,option) {
    const textNode = document.createTextNode(text);
    if(option != null) option.apply(textNode);
    return textNode;
}

/* ----------------------------------------------------------------------------------------------------
Inputs
---------------------------------------------------------------------------------------------------- */
/**
 * @typedef {Object} InputOptions
 * @property {string} [className]
 * @property {DOMOption} [option]
 * @property {string} [name]
 * @property {string} [value]
 * @property {EventHandler} [event]
 * @property {EventHandler[]} [events]
 */

/**
 * Build HTML Inputs
 * @namespace Input
 */
export const Input = {
    

    /**
     * Build input element
     * @param {InputType} type
     * @param {InputOptions} options 
     * @return {HTMLInputElement}
     */
    custom: function(type, {className,option, name, value,event, events} = {}) {
        const input = /** @type {HTMLInputElement} */ (element("input",className,option));
        input.type = type;
    
        if (value != null) {input.value = value;}
        if (name != null) {input.name = name;}
    
        // Events
        if(event != null) {
            if(events == null) {
                events = [event];
            } else {
                events.push(event);
            }
        }
        if(events != null) {
            for (let i = 0; i < events.length; i++) {
                const handler = events[i];
                input.addEventListener(handler.event, handler.handler);
            }
        }
        return input;
    },

    /**
     * Build a text input element
     * @param {("text" | "email" | "password" | "search" | "url" | "tel")} type
     * @param {InputOptions} options 
     * @param {Object} [textOptions = {}]
     * @param {string} [textOptions.placeholder]
     * @param {number} [textOptions.minLength] 
     * @param {number} [textOptions.maxLength]
     * @param {string} [textOptions.pattern] Pattern to match in validation
     * @param {boolean} [textOptions.readOnly] Wether the input can be written to
     * @return {HTMLInputElement}
     */
    text: function(type, options, textOptions = {}) {
        const text = this.custom(type,options);
        const {placeholder = "", minLength, maxLength, pattern, readOnly} = textOptions
        if (minLength != null) {text.minLength = minLength;}
        if (maxLength != null) {text.maxLength = maxLength;}
        if (pattern != null) {text.pattern = pattern;}
        if (readOnly != null) {text.readOnly = readOnly;}
        text.placeholder = placeholder;
        return text;
    },

    /**
     * Build color input element
     * @param {InputOptions} options 
     * @return {HTMLInputElement}
     */
    color: function(options={}) {return this.custom("color",options)},

    /**
     * Build hiddent input element
     * @param {InputOptions} options 
     * @return {HTMLInputElement}
     */
    hidden: function(options={}) {return this.custom("hidden",options)},


    /**
     * Build clickable 
     * @param {InputType} type 
     * @param {eventCallback} [onClick] 
     * @param {InputOptions} [options] 
     */
    clickable: function(type, onClick, options={}) {

        if(onClick != null) {
            if(options["events"]) {
                options["events"].push({
                    handler: onClick,
                    event:"click"
                });
            } else {
                options["events"] = [{
                    handler: onClick,
                    event:"click"
                }];
            }
            
        }
        return Input.custom(type,options);
    },


    /**
     * Build button input element
     * @param {("button" | "submit" | "reset" | "image")} type
     * @param {string} value If type is image, this will be used for src
     * @param {eventCallback} [onClick] Callback for click event
     * @param {InputOptions} [options] 
     * @return {HTMLInputElement}
     */
    button: function(type, value, onClick,options={}) {
        if (type != "image") {
            options["value"] = value;
        }
        const input =  Input.clickable(type, onClick,options);
        if (type == "image") {
            input.src = value
        }
        return input
    },

    /**
     * Build radio or checkbox
     * @param {("radio" | "checkbox")} type 
     * @param {boolean} checked 
     * @param {eventCallback} [onClick] Callback for click event
     * @param {InputOptions} [options]
     * @return {HTMLInputElement}
     */
    checkable: function(type, checked, onClick, options={}) {
        const input = this.clickable(type,onClick,options);
        input.checked = checked;
        return input;
    },

    /**
     * Build checkbox
     * @param {boolean} checked 
     * @param {eventCallback} [onClick] Callback for click event
     * @param {InputOptions} [options]
     * @return {HTMLInputElement}
     */
    checkbox: function(checked, onClick, options) {return this.checkable("checkbox",checked, onClick, options)},
    

    /**
     * Adds radio options to container
     * @param {HTMLElement} parent
     * @param {string} name
     * @param {string[]} options
     * @param {eventCallback} [onClick] Callback for click event
     * @param {InputOptions} [inputOption] Option and name will be overwritten
     * @param {number} [checkedIndex] 
     */
    radio: function(parent, name, options, onClick, inputOption={}, checkedIndex = -1) {
        const domOption = DOMOptions.append(parent);
        inputOption["option"] = domOption;
        inputOption["name"] = name
        for (let i = 0; i < options.length; i++) {
            inputOption.value = options[i];
            const r = this.checkable("radio",i==checkedIndex,onClick,inputOption);
            const label = element("label",inputOption["className"],domOption);
            label.innerHTML = options[i];
        }
    },

    /**
     * Build number/range input with min, max and step values
     * @param {("number" | "range")} type
     * @param {number} [min] 
     * @param {number} [max] 
     * @param {number} [step] 
     * @param {InputOptions} [options] 
     * @return {HTMLInputElement}
     */
    number: function(type, min,max,step, options ={}) {
        const input = this.custom(type,options);
        if(min != null) {input.min = min + ""}
        if(max != null) {input.max = max + ""}
        if(step != null) {input.step = step + ""}
        return input
    }

    //TODO: "file" | "date" | "datetime-local" | "month" | "time" | "week"

}

/**
 * Buld SVG elements
 * @namespace Svg
 */
 export const Svg = {
    /**
     * @typedef {"feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence"} SVGFilterTag
     */
    
    /**
     *  @typedef {"circle" | "ellipse" | "path" | "polygon" | "polyline" | "rect"} SVGShapeTag
     */
    
    
    /** 
     * @typedef {SVGFilterTag | SVGShapeTag | "a" | "clipPath" | "defs" | "desc" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "pattern" | "radialGradient" | "script" | "stop" | "style" | "svg" | "switch" | "symbol" | "text" | "textPath" | "title" | "tspan" | "use" | "view" } SVGTag 
     */
    
    /** @typedef {Object.<string,string | number>} SVGAttributes*/
    
    /**
     * @typedef {Object} SVGDescriptor
     * @property {SVGTag} tag
     * @property {SVGAttributes} attributes
     */
    
    
    /**
     * Creates an SVG element of the given tag
     * @param {SVGTag} tag 
     * @param {SVGAttributes} [attributes] 
     * @param {DOMOption} [option] 
     * @returns {SVGElement}
     */
    svgElement: function(tag, attributes = {}, option) {
        const element = document.createElementNS("http://www.w3.org/2000/svg",tag)
        for (const attribute in attributes) {
            element.setAttribute(attribute,String(attributes[attribute]));
        }
        if(option) option.apply(element)
    
        return element
    },
    
    /**
     * Create an SVG element with the given elements created inside
     * @param {SVGDescriptor[]} elements 
     * @param {string} className
     * @param {DOMOption} [option]
     * @param {Object<string,string>} [attributes]
     * @returns {SVGElement}
     */
    svgIcon: function (elements, className, option, attributes) {
        const svg = Svg.svgElement("svg",{class:className, ...attributes}, option)
        const appendToIcon = DOMOptions.append(svg);
        for (const att of elements) {
            Svg.svgElement(att.tag,att.attributes,appendToIcon);
        }
        return svg;
    }
}