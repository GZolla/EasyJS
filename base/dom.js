// @ts-check

/**
 * Utility Functions and options to add elements to DOM
 * @module DOM
 */

/* ----------------------------------------------------------------------------------------------------
DOM Handling Functions
---------------------------------------------------------------------------------------------------- */
/**
 * @callback domOptionCallback
 * @param {Node} element Element to insert
 * @param {Node} reference Reference Element
 */

/**
 * Insert given element after reference element
 * @type {domOptionCallback}
 */
export function insertAfter(element, reference) {
    if(!reference.parentNode) throw new Error("Not in  DOM");
    reference.parentNode.insertBefore(element, reference.nextSibling)
}

/**
 * Insert given element before reference element
 * @type {domOptionCallback}
 */
export function insertBefore(element, reference) {
    if(!reference.parentNode) throw new Error("Not in  DOM");
    reference.parentNode.insertBefore(element, reference)
}

/**
 * Insert element as first child of parent
 * @type {domOptionCallback}
 */
export function insertFirst(element, reference) {
    reference.insertBefore(element,reference.firstChild)
}

/**
 * Remove element from DOM
 * @param {Node?} [element]
 */
export function removeElement(element) {
    if(element && element.parentNode) {
        element.parentNode.removeChild(element)
    }
}

/**
 * Remove all elements in array given
 * @param {Element[] | HTMLCollection} elements 
 */
export function removeElements(elements) {
    if(elements instanceof HTMLCollection) elements = [...elements];
    
    for (const element of elements) {
        removeElement(element)
    }
}

/* ----------------------------------------------------------------------------------------------------
DOM OPTIONS: Options for inserting elements into the DOM
---------------------------------------------------------------------------------------------------- */
export class DOMOption {
    /**
     * Builds a DOM insertion option
     * @param {Node} referenceElement
     * @param {domOptionCallback} callback
     */
    constructor(referenceElement, callback) {
        this.referenceElement = referenceElement;
        this.callback = callback;
    }

    /**
     * Apply option to element
     * @param {Node} element 
     */
    apply(element) {
        this.callback(element,this.referenceElement)
    }
}

export class DOMOptions {

    /**
     * Returns a DomOption with custom callback
     * @param {Node} referenceElement
     * @param {domOptionCallback} callback
     * @returns {DOMOption} 
     */
    static custom(referenceElement,callback) {
        return new DOMOption(referenceElement,callback);
    }


    /**
     * Append into reference element
     * @param {Node} referenceElement 
     * @returns {DOMOption}
     */
    static append(referenceElement) {
        return this.custom(referenceElement,(e, r)=>{r.appendChild(e)});
    }


    /**
     * Insert before reference element
     * @param {Node} referenceElement 
     * @returns {DOMOption}
     */
    static before = (referenceElement) => {
        return this.custom(referenceElement, insertBefore);
    }


    /**
     * Insert after reference element
     * @param {Node} referenceElement 
     * @returns {DOMOption}
     */
    static after(referenceElement) {
        return this.custom(referenceElement,insertAfter); 
    }


    /**
     * Insert as first child of reference element
     * @param {Node} referenceElement 
     * @returns {DOMOption}
     */
    static first(referenceElement) {
        return this.custom(referenceElement,insertFirst);
    }
}

/**
 * Add an event that triggers after the mouse is not moving inside an element for a given amount of time.
 * @param {HTMLElement} element Element to add event to 
 * @param {function} callback Callback for event
 * @param {number} [delay] Time in milliseconds before event is triggered
 */
export function addMaintainHoverEvent(element,callback, delay = 2000) {
    const launch = (e) => {
        triggerMaintainHoverEvent(callback,delay,e)
    }
    element.addEventListener("mouseenter",launch);
    element.addEventListener("mousemove",(e)=> {
        cancelMaintainHoverEvent(e);
        launch(e);
    })
    element.addEventListener("mouseleave",cancelMaintainHoverEvent);
}

/**
 * @param {function} callback Callback for event
 * @param {number} delay Time in milliseconds before event is triggered
 * @param {MouseEvent} e 
 */
function triggerMaintainHoverEvent(callback,delay,e) {
    const ele = /** @type {HTMLElement}*/(e.currentTarget)
    const tryCallback = setTimeout(()=>{callback(e)},delay);
    ele.dataset["maintainHoverTimeout"] = tryCallback + "";
}

/**
 * @param {MouseEvent} e 
 */
function cancelMaintainHoverEvent(e) {
    const ele = /** @type {HTMLElement}*/(e.currentTarget)
    clearTimeout(Number(ele.dataset["maintainHoverTimeout"]))
}



