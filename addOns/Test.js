// @ts-check

import { BUILD } from "../base/build.js";
import { loadCSS } from "../base/css.js";
import { DOMOption, DOMOptions } from "../base/dom.js";
loadCSS("testCss","test/index.css");

/* ----------------------------------------------------------------------------------------------------
Basic testers
---------------------------------------------------------------------------------------------------- */

/**
 * Build the container for test displays
 * @param {HTMLElement} parent 
 * @returns {[HTMLElement,HTMLElement]}
 */
function buildTestContainer(parent) {
    const container = BUILD.element("div","test",DOMOptions.append(parent));
    const appendContainer = DOMOptions.append(container);
    const title = BUILD.element("h2","test_title",appendContainer);

    return [container, title]
}





export default class Test {
    /**
     * @template {*} Actual
     * @template {*} Expected
     * @template {*[]} Input
     * @callback ActualExpectInput Check actual against expected
     * @param {Actual} actual
     * @param {Expected} expected
     * @param {Input} input
     * @param {HTMLElement} parent
     * @return {string | null | Promise<string | null>}  
     */

    

    
    /**
     * @template {*[]} Input
     * @template {*} Output
     * @template {*} Expected
     * @param {(...args: Input)=> (Output | Promise<Output>)} process 
     * @param {Input[]} inputs 
     * @param {Expected[]} expecteds 
     * @param {ActualExpectInput<Output,Expected,Input>} check 
     * @param {HTMLElement} parent 
     * @return {Promise<boolean>}
     */
    static async function(process, inputs, expecteds, check, parent = document.body) {
        if(inputs.length != expecteds.length) throw new Error("Input and expected arrays must be the same length");

        const container = BUILD.element("div","test",DOMOptions.append(parent));
        const appendContainer = DOMOptions.append(container);
        const title = BUILD.element("h2","test_title",appendContainer);
        
        var successes = 0;
        var actuals = await Promise.all(inputs.map((inp) => process(...inp)));
        for (let i = 0; i < inputs.length; i++) {

            const errorOrNull = await check(actuals[i],expecteds[i],inputs[i], container);
            if(errorOrNull == null) successes++
            else if(errorOrNull != "") {
                const errorDisplay = BUILD.element("li","failed",appendContainer)
                errorDisplay.innerHTML = errorOrNull
            }
        }
        title.innerHTML = `TESTING ${process.name}: ${successes} of ${inputs.length} tests passed`
        container.classList.add(successes == inputs.length ? "succeeded" : "failed")

        return successes == inputs.length
    }

    /**
     * @template {*[]} Input
     * @template {*} Output
     * @template {*} Expected
     * @typedef {Object} InstanceFunctionTest
     * @property {string} name
     * @property {Input[]} inputs 
     * @property {Expected[]} expecteds
     * @property {ActualExpectInput<Output,Expected,Input>} check 
     */

    /**
     * @template {Object} Output
     * @template {*} Expected
     * @template {*[]} Input
     * @param {Output} instance 
     * @param {Expected} expected
     * @param {Input} input
     * @param {ActualExpectInput<Output, Expected, Input>} testConstruction 
     * @param {InstanceFunctionTest<*[],*,*>[]} functionTests 
     * @param {HTMLElement} parent 
     * @return {Promise<boolean>}
     */
    static async instance(instance, expected, input, testConstruction, functionTests, parent) {
        const container = BUILD.element("div","test",DOMOptions.append(parent));
        const appendContainer = DOMOptions.append(container);
        const title = BUILD.element("h2","test_title",appendContainer);
        title.innerHTML = `TESTING INSTANCE OF ${instance["constructor"].name}`
        const constTitle = BUILD.element("h3","test_title",appendContainer);
        constTitle.innerHTML = "Constructor:"

        const constructionError = await testConstruction(instance, expected,input,parent)
        if (constructionError) {
            const errorDisplay = BUILD.element("li","failed",appendContainer)
            container.classList.add("failed")
            constTitle.innerHTML +=" Failed"
            errorDisplay.innerHTML = constructionError
            return false
        } else {
            constTitle.innerHTML +=" Success"
        }

        if (functionTests.length != 0) {
            const funcTitle = BUILD.element("h3","test_title",appendContainer);
            funcTitle.innerHTML = "Functions:"
        }

        const results = await Promise.all(functionTests.map(
            (test) => {
                if(typeof instance[test.name] != "function") 
                    throw new Error(`${test.name} should be a function but is a ${typeof instance[test.name]}`)
                return Test.function(instance[test.name].bind(instance),test.inputs,test.expecteds,test.check,container)
            }
        ))

        const success = results.reduce((prev,res)=>(res&&prev),true)
        container.classList.add(success ? "succeeded" : "failed")
        return success
    }


    /**
     * 
     * @template {*[]} Input
     * @template {any} Output
     * @template {*} Expected
     * @param {new (...args: Input) => Output} constructor 
     * @param {Input[]} inputs 
     * @param {Expected[]} expecteds
     * @param {ActualExpectInput<Output, Expected, Input>} testConstruction 
     * @param {InstanceFunctionTest<*[],*,*>[]} functionTests
     * @param {HTMLElement} parent 
     */
    static async class(constructor, inputs, expecteds, testConstruction, functionTests, parent = document.body) {
        return await Test.function(
            (...inp)=> new constructor(...inp),
            inputs,
            expecteds,
            async (actual, expected, input, parent)=>{
                return (await Test.instance(actual,expected,input,testConstruction,functionTests,parent)) ? null : ""
            }
        )
    }

    /* ----------------------------------------------------------------------------------------------------
    Default checks
    ---------------------------------------------------------------------------------------------------- */

    /**
     * 
     * @template {*[]} Input
     * @template {string | number} T
     * @type {ActualExpectInput<T, T, Input>}
     */
    static isEqual(actual, expected, input, parent) {
        if(actual === expected) return null
        return `Expected {${actual}} to be {${expected}}`
    }


    
    /**
     * Check that objects are deeply equal
     * @template {*[]} Input
     * @type {ActualExpectInput<Object.<string,any>, Object.<string,any>, Input>}
     */
    static isDeepEqual(actual, expected, input, parent) {
        for (const key in expected) {
            if(!(key in actual)) return "Actual is missing key: " + key
            const expectedType = typeof expected[key]
            if(typeof actual[key] != expectedType) return `Type mismatch: ${key} should ${expectedType} but is ${typeof actual[key]}`
            const error =expectedType == "object"? Test.isDeepEqual(actual[key],expected[key],input,parent)
                                                    : Test.isEqual(actual[key],expected[key],input,parent)
            if(error) return error
        }
        return null
    }

    /**
     * Check that two arrays are equal in any order
     * @template {*[]} Input
     * @template {any} T
     * @type {ActualExpectInput<T[], T[], Input>}
     */
    static isEqualDisordered(actual, expected, input, parent) {
        if(actual.length != expected.length) return "Arrays have different lengths.";
        for (let i = 0; i < expected.length; i++) {
            const indexInActual = actual.indexOf(expected[i]);
            if(indexInActual < 0) return `Expected actual to include ${expected[i]}`;
            actual.splice(indexInActual,1);
        }
        return null;
    }
}