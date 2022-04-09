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
/**
 * @typedef {Object} DomOption
 * @property {domOptionCallback} callback
 * @property {Element} reference
 */

export class DOMOptions {

    /**
     * Create DOMOptions for reference element
     * @param {Element} referenceElement 
     */
    constructor(referenceElement) {
        this.reference = referenceElement;
    }

    /**
     * Returns a DomOption with custom callback
     * @param {domOptionCallback} callback
     * @returns {DomOption} 
     */
    custom(callback) {
        return {
            callback:callback,
            reference:this.reference,
        }
    }


    /**
     * Append into reference element
     * @returns {DomOption}
     */
    append() {
        return this.custom((element, reference)=>{reference.appendChild(element)});
    }


    /**
     * Insert before reference element
     * @returns {DomOption}
     */
    before() {
        return this.custom(insertBefore);
    }


    /**
     * Insert after reference element
     */
    after() {
        return this.custom(insertAfter); 
    }


    /**
     * Insert as first child of reference element
     */
    first() {
        return this.custom(insertFirst);
    }
}

