// @ts-check

import * as Build from "../../base/build.js";
import { loadCSS } from "../../base/css.js";
import { DOMOptions, DOMOption, removeElement } from "../../base/dom.js";
import { PATH_TO_EJS } from "../../settings.js";
loadCSS("ejs-displays",PATH_TO_EJS + "addOns/displays/index.css");

/**
 * Builder of common displays for html
 * @module Displays
 */

export class Dropdown {
    static OPEN_CLASSNAME = "ejs-carrousel-open";

    /** @type {HTMLElement} */ container;
    /** @type {HTMLElement} */ header;
    /** @type {HTMLElement} */ content;
    /** @type {Carrousel | undefined} */ carrousel;
    /** @type {Dropdown | undefined} */ parent;
    /** @type {function | undefined}  */ onOpen;
    /** @type {function | undefined} */ onClose;
    /** @type {boolean} */ noClose;

    /**
     * 
     * @param {string} header 
     * @param {Object} d
     * @param {string} [d.className] 
     * @param {DOMOption} [d.option] 
     * @param {Carrousel} [d.carrousel]
     * @param {Dropdown} [d.parent]
     * @param {function} [d.onClose]
     * @param {function} [d.onOpen]
     * @param {boolean} [d.noClose]
     */
    constructor(header,{className,option, carrousel, parent, onClose, onOpen, noClose = false} = {}) {
        this.onClose = onClose;
        this.onOpen = onOpen;
        this.parent = parent;
        this.noClose = noClose;
        this.container = Build.element("div",className + " ejs-carrousel",option);
        const containerOption = DOMOptions.append(this.container);
        this.header = Build.element("div","ejs-carrousel-header",containerOption);

        
        this.header.innerHTML = header;
        this.header.addEventListener("click",this.toggle.bind(this));

        this.content = Build.element("div","ejs-carrousel-content",containerOption);
        carrousel?.add(this);
    }

    /**
     * Set the state of the Carrousel
     * @param {boolean} [open] 
     */
    setState(open = true) {
        this.container.classList[open?"add":"remove"](Dropdown.OPEN_CLASSNAME);
        if(open && this.onOpen) this.onOpen();
        if(!open && this.onClose) this.onClose();
    }

    /**
     * Toggle Carrousel
     */
    toggle() {
        const closed = !this.container.classList.contains(Dropdown.OPEN_CLASSNAME);
        if(closed) this.carrousel?.checkAutoClose(this)
        this.setState(closed || this.noClose);
    }

    /**
     * Change the header of the dropdown
     * @param {string} header 
     */
    changeTitle(header) {
        this.header.innerHTML = header;
    }
}

export class Carrousel {
    /** @type {Dropdown[]} */ dropdowns;
    /** @type {boolean} */ autoClose;

    /**
     * 
     * @param {Dropdown[]} dropdowns 
     * @param {boolean} autoClose
     */
    constructor(dropdowns = [], autoClose = true) {
        this.dropdowns = dropdowns;
        this.autoClose = autoClose
    }

    /**
     * Close all except direct line of given dropdown
     * @param {Dropdown} [dropdown] Dropdown to exclude from closing, aswell as its ancestors
     */
    closeAll(dropdown) {
        /** @type {Dropdown[]} */
        const except = []
        while(dropdown !== undefined) {
            except.push(dropdown)
            dropdown = dropdown.parent;
        }

        for (const dropdown of this.dropdowns) {
            if(except.indexOf(dropdown) === -1) dropdown.setState(false);
        }
    }

    openAll() {
        for (const dropdown of this.dropdowns) {
            dropdown.setState(true);
        }
    }

    /**
     * 
     * @param {Dropdown} [dropdown] 
     */
    checkAutoClose(dropdown) {
        if(this.autoClose) this.closeAll(dropdown)
    }

    /**
     * Add a dropdown to carrousel
     * @param {Dropdown} dropdown 
     */
    add(dropdown) {
        this.dropdowns.push(dropdown);
        dropdown.carrousel = this;
    }


}


export class NavBar {
    /** @type {HTMLElement} */ navElement;
    /** @type {Object.<string,NavBarElement>} */ elements = {};
    /** @type {NavBarElement | null} */ active = null;

    /**
     * @typedef {Object} NavBarElement
     * @prop {HTMLElement} li
     * @prop {HTMLElement} element
     * @prop {DOMOption} option
     */

    /**
     * Build a navbar to remove elements from DOM if another nav item is selected
     * @param {HTMLElement} navElement 
     */
    constructor(navElement) {
        this.navElement = navElement;
    }

    /**
     * 
     * @param {string} name 
     * @param {HTMLElement} element 
     * @param {DOMOption} option
     */
    add(name, element, option) {

        const li = Build.element("li","ejs-navbar-li",DOMOptions.append(this.navElement));
        li.addEventListener("click",this.open.bind(this,name))
        li.innerHTML = name
        this.elements[name] = {
            li:li, element:element, option:option
        }
    }

    /**
     * 
     * @param {string} name 
     */
    open(name) {
        if(this.active !== null) {
            this.active.li.classList.remove("ejs-navbar-active-li")
            removeElement(this.active.element)
        }
        this.active = this.elements[name];
        this.active.li.classList.add("ejs-navbar-active-li");
        this.active.option.apply(this.active.element)
    }

}