// @ts-check
import {BUILD} from "../build.js"
import {DOMOptions} from "../dom.js"


/**
 * Build elements in elementList into dom
 *  - The first is appended
 *  - the second before the first
 *  - the third after the second
 *  - the last as first element
 */
function buildElements() {
    /** @type {(keyof HTMLElementTagNameMap)[]} */
    const elementList = ["span","div","p","article"]
    let option = DOMOptions.append(document.body);
    for (let i = 0; i < elementList.length; i++) {
        const element = BUILD.element(elementList[i], "insertedElement", option);
        element.innerHTML = "Element " + i + ": " + elementList[i];
        option = i == 0 ? DOMOptions.before(element)
                : i == 1 ? DOMOptions.after(element)
                :DOMOptions.first(document.body)
    }
}


/**
 * Alert the value of the current target of the event
 * @param {Event} e 
 */
function alertProperties(e) {
    const ele =/**@type {HTMLInputElement} */ (e.currentTarget)
    alert(
        "Value:" + ele.value +"\n" +
        "Name:" + ele.name +"\n" + 
        "Classname:" + ele.className +"\n"
    )
}
function buildInputs() {
    /** @type {import("../build.js").InputType[]} */
    const inputTypes = ["button", "checkbox", "color", "date", "datetime-local", "email", "file", "hidden", "image", "month", "number", "password", "radio", "range", "reset", "search", "submit", "tel", "text", "time", "url", "week"]
    
    const bodyAppend = DOMOptions.append(document.body);

    BUILD.input.text("password",{
        "className":"text_classname",
        "event":{handler:alertProperties,event:"change"},
        "value": "TEXT VALUE"
    })

    BUILD.input.text("password",{"option":bodyAppend},{
        "placeholder":"Password placeholder",
        "maxLength":16,
        "minLength":8
    })

    BUILD.input.text("tel",{"option":bodyAppend},{"pattern":"[0-9]{3}\-[0-9]{4}"})
    BUILD.input.text("email",{"value":"anon@domain.com"},{"readOnly":true})
    
    /** @type {("button" | "submit" | "reset")[]} */
    const buttonTypes = ["button", "submit", "reset"]
    for (const t of buttonTypes) {
        BUILD.input.button(t,t,alertProperties,{
            "name": t + "_name",
            "className": t + "_classname",
            "option":bodyAppend
        })
    }
    BUILD.input.button("image","./img_submit.gif",alertProperties,{"option": bodyAppend})

    BUILD.input.checkbox(true,null,{"option":bodyAppend})
    BUILD.input.checkbox(false,alertProperties,{"option":bodyAppend,value:"checkBoxValue"})
    BUILD.input.radio(document.body,"radio_name",["a","b","c"])
}

window.onload = buildInputs