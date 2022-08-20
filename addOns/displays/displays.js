// @ts-check

import { BUILD } from "../../base/build.js";
import { loadCSS } from "../../base/css.js";
import { DOMOptions, DOMOption, removeElement } from "../../base/dom.js";
loadCSS("ejs-displays","addOns/displays/index.css");

export class Dropdown {
    static OPEN_CLASSNAME = "ejs-carrousel-open";

    /** @type {HTMLElement} */ container;
    /** @type {HTMLElement} */ header;
    /** @type {HTMLElement} */ content;
    /** @type {Carrousel | undefined} */ carrousel;

    /**
     * 
     * @param {string} header 
     * @param {string} [className] 
     * @param {DOMOption} [option] 
     * @param {Carrousel} [carrousel]
     */
    constructor(header,className,option, carrousel) {
        this.container = BUILD.element("div",className + " ejs-carrousel",option);
        const containerOption = DOMOptions.append(this.container);
        this.header = BUILD.element("div","ejs-carrousel-header",containerOption);

        
        this.header.innerHTML = header;
        this.header.addEventListener("click",this.toggle.bind(this));

        this.content = BUILD.element("div","ejs-carrousel-content",containerOption);
        this.carrousel = carrousel;
    }

    /**
     * Set the state of the Carrousel
     * @param {boolean} [open] 
     */
    setState(open = true) {
       this.container.classList[open?"add":"remove"](Dropdown.OPEN_CLASSNAME) 
    }

    /**
     * Toggle Carrousel
     */
    toggle() {
        if(!this.container.classList.contains(Dropdown.OPEN_CLASSNAME)) this.carrousel?.checkAutoClose()
        this.container.classList.toggle(Dropdown.OPEN_CLASSNAME)
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

    closeAll() {
        for (const dropdown of this.dropdowns) {
            dropdown.setState(false);
        }
    }

    checkAutoClose() {
        if(this.autoClose) this.closeAll()
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

        const li = BUILD.element("li","ejs-navbar-li",DOMOptions.append(this.navElement));
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