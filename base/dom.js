// @ts-check



/* ----------------------------------------------------------------------------------------------------
DOM Handling Functions
---------------------------------------------------------------------------------------------------- */
/**
 * @callback domOptionCallback
 * @param {Element} element 
 * @param {Element} reference 
 */

/**
 * Insert given element after reference element
 * @param {Element} element Element to insert
 * @param {Element} reference Reference Element
 */
export function insertAfter(element, reference) {
    reference.parentNode.insertBefore(element, reference.nextElementSibling)
}

/**
 * Insert given element before reference element
 * @param {Element} element  Element to insert
 * @param {Element} reference Reference Element
 */
export function insertBefore(element, reference) {
    reference.parentNode.insertBefore(element, reference)
}

/**
 * Insert element as first child of parent
 * @param {Element} element Element to insert
 * @param {Element} reference Parent element
 */
export function insertFirst(element, reference) {
    reference.insertBefore(element,reference.firstChild)
}

/**
 * Remove element from DOM
 * @param {Element} element
 */
export function removeElement(element) {
    if(element != null) {
        element.parentNode.removeChild(element)
    }
}

/* ----------------------------------------------------------------------------------------------------
DOM OPTIONS: Options for inserting elements into the DOM
---------------------------------------------------------------------------------------------------- */
export class DOMOption {
    /**
     * Builds a DOM insertion option
     * @param {Element} referenceElement
     * @param {domOptionCallback} apply
     */
    constructor(referenceElement, apply) {
        this.referenceElement = referenceElement;
        this.apply = apply;
    }
}

export class DOMOptions {

    /**
     * Returns a DomOption with custom callback
     * @param {Element} referenceElement
     * @param {domOptionCallback} callback
     * @returns {DOMOption} 
     */
    static custom(referenceElement,callback) {
        return new DOMOption(referenceElement,callback);
    }


    /**
     * Append into reference element
     * @param {Element} referenceElement 
     * @returns {DOMOption}
     */
    static append(referenceElement) {
        return this.custom(referenceElement,(e, r)=>{r.appendChild(e)});
    }


    /**
     * Insert before reference element
     * @param {Element} referenceElement 
     * @returns {DOMOption}
     */
    static before = (referenceElement) => {
        return this.custom(referenceElement, insertBefore);
    }


    /**
     * Insert after reference element
     * @param {Element} referenceElement 
     * @returns {DOMOption}
     */
    static after(referenceElement) {
        return this.custom(referenceElement,insertAfter); 
    }


    /**
     * Insert as first child of reference element
     * @param {Element} referenceElement 
     * @returns {DOMOption}
     */
    static first(referenceElement) {
        return this.custom(referenceElement,insertFirst);
    }
}

