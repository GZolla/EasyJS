// @ts-check

import { DOMOptions,DOMOption } from "./dom.js";



/* ----------------------------------------------------------------------------------------------------
Create Elements
---------------------------------------------------------------------------------------------------- */
/**
 * @typedef {( "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week" )} InputType
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
 * @property {keyof HTMLElementEventMap} event
 * @property {eventCallback} handler
 */




/**
 * Static class used as namespace for HTML element builders
 */
export class BUILD {
    /**
     * Creates an element of the given tag
     * @param {keyof HTMLElementTagNameMap} tag 
     * @param {string} className 
     * @param {DOMOption} [option] 
     * @return {HTMLElement}
     */
    static element(tag, className = "", option) {
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
     */
    static img(src, alt, className = "",option) {
        const img =/**@type {HTMLImageElement}*/ (BUILD.element("img",className,option));
        img.src = src;
        img.alt = alt;
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
    static input = class {
        

        /**
         * Build input element
         * @param {InputType} type
         * @param {InputOptions} options 
         * @return {HTMLInputElement}
         */
        static custom(type, {className,option, name, value,event, events} = {}) {
            const input = /** @type {HTMLInputElement} */ (BUILD.element("input",className,option));
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
        }

        /**
         * Build a text input element
         * @param {("text" | "email" | "password" | "search" | "url" | "tel")} type
         * @param {InputOptions} options 
         * @param {Object} [textOptions]
         * @param {string} [textOptions.placeholder]
         * @param {number} [textOptions.minLength] 
         * @param {number} [textOptions.maxLength]
         * @param {string} [textOptions.pattern] Pattern to match in validation
         * @param {boolean} [textOptions.readOnly] Wether the input can be written to
         * @return {HTMLInputElement}
         */
        static text(type, options, {placeholder = "", minLength, maxLength, pattern, readOnly} = {}) {
            const text = this.custom(type,options);

            if (minLength != null) {text.minLength = minLength;}
            if (maxLength != null) {text.maxLength = maxLength;}
            if (pattern != null) {text.pattern = pattern;}
            if (readOnly != null) {text.readOnly = readOnly;}
            text.placeholder = placeholder;
            return text;
        }

        /**
         * Build color input element
         * @param {InputOptions} options 
         * @return {HTMLInputElement}
         */
        static color(options={}) {return this.custom("color",options)}

        /**
         * Build hiddent input element
         * @param {InputOptions} options 
         * @return {HTMLInputElement}
         */
        static hidden(options={}) {return this.custom("hidden",options)}


        /**
         * Build clickable 
         * @param {InputType} type 
         * @param {eventCallback} [onClick] 
         * @param {InputOptions} [options] 
         */
        static clickable(type, onClick, options={}) {

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
            return BUILD.input.custom(type,options);
        }


        /**
         * Build button input element
         * @param {("button" | "submit" | "reset" | "image")} type
         * @param {string} value If type is image, this will be used for src
         * @param {eventCallback} [onClick] Callback for click event
         * @param {InputOptions} [options] 
         * @return {HTMLInputElement}
         */
        static button(type, value, onClick,options={}) {
            if (type != "image") {
                options["value"] = value;
            }
            const input =  BUILD.input.clickable(type, onClick,options);
            if (type == "image") {
                input.src = value
            }
            return input
        }

        /**
         * Build radio or checkbox
         * @param {("radio" | "checkbox")} type 
         * @param {boolean} checked 
         * @param {eventCallback} [onClick] Callback for click event
         * @param {InputOptions} [options]
         * @return {HTMLInputElement}
         */
        static checkable(type, checked, onClick, options={}) {
            const input = this.clickable(type,onClick,options);
            input.checked = checked;
            return input;
        }

        /**
         * Build checkbox
         * @param {boolean} checked 
         * @param {eventCallback} [onClick] Callback for click event
         * @param {InputOptions} [options]
         * @return {HTMLInputElement}
         */
        static checkbox(checked, onClick, options) {return this.checkable("checkbox",checked, onClick, options)}
        

        /**
         * Adds radio options to container
         * @param {HTMLElement} parent
         * @param {string} name
         * @param {string[]} options
         * @param {eventCallback} [onClick] Callback for click event
         * @param {InputOptions} [inputOption] Option and name will be overwritten
         * @param {number} [checkedIndex] 
         */
        static radio(parent, name, options, onClick, inputOption={}, checkedIndex = -1) {
            const domOption = DOMOptions.append(parent);
            inputOption["option"] = domOption;
            inputOption["name"] = name
            for (let i = 0; i < options.length; i++) {
                inputOption.value = options[i];
                const r = this.checkable("radio",i==checkedIndex,onClick,inputOption);
                const label = BUILD.element("label",inputOption["className"],domOption);
                label.innerHTML = options[i];
            }
        }

        /**
         * Build number/range input with min, max and step values
         * @param {("number" | "range")} type
         * @param {number} [min] 
         * @param {number} [max] 
         * @param {number} [step] 
         * @param {InputOptions} [options] 
         * @return {HTMLInputElement}
         */
        static number(type, min,max,step, options ={}) {
            const input = this.custom(type,options);
            if(min != null) {input.min = min + ""}
            if(max != null) {input.max = max + ""}
            if(step != null) {input.step = step + ""}
            return input
        }

        //TODO: "file" | "date" | "datetime-local" | "month" | "time" | "week"

    }


    /* ----------------------------------------------------------------------------------------------------
    SVG
    ---------------------------------------------------------------------------------------------------- */

    /** @typedef {keyof SVGElementTagNameMap} SVGTag */

    /**
     * Creates an SVG element of the given tag
     * @param {SVGTag} tag 
     * @param {Object.<string,string>} attributes 
     * @param {DOMOption} [option] 
     * @returns {SVGElement}
     */
     static svgElement(tag, attributes = {}, option) {
        const element = document.createElementNS("http://www.w3.org/2000/svg",tag)
        for (const attribute in attributes) {
            element.setAttribute(attribute,attributes[attribute]);
        }
        if(option) option.apply(element)

        return element
    }


    /**
     * Create an SVG element with the given elements created inside
     * @param {[SVGTag,Object.<string,string>][]} elements 
     * @param {string} className
     * @param {[number,number,number,number]} viewBox
     * @param {DOMOption} [option]
     * @returns {SVGElement}
     */
    static svgIcon(elements, className, viewBox, option) {
        const svg = BUILD.svgElement("svg",{viewBox:viewBox.join(" "),class:className}, option)
        const appendToIcon = DOMOptions.append(svg);
        for (const att of elements) {
            BUILD.svgElement(att[0],att[1],appendToIcon);
        }
        return svg;
    }
}