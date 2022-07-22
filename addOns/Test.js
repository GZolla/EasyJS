// @ts-check

import { BUILD } from "../base/build.js";
import { loadCSS } from "../base/css.js";
import { DOMOption, DOMOptions } from "../base/dom.js";
import { PATH_TO_EJS } from "../settings.js";
loadCSS("testCss",PATH_TO_EJS + "addOns/Test.css");




export default class Test {
    /* ----------------------------------------------------------------------------------------------------
    Types and helpers
    ---------------------------------------------------------------------------------------------------- */
    /**
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Actual Type of actual output
     * @template {*} Expected Type of expected output
     * @callback CheckFunctionCall Check actual result against expected result
     * @param {Actual} actual The actual result of the function call
     * @param {Expected} expected The expected result of the function call
     * @param {Input} input The input parameters passed to the function call
     * @param {HTMLElement} [parent] The parent element in which to display errors
     * @param {number} [index] Index of the check being applied
     * @return {(string | null) | Promise<(string | null)>}  Either null or error message on fail
     */


    /**
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Expected Type of expected output
     * @typedef {Object} Check An input, an expected output and wether the output is an exception
     * @property {Input} input The input parameters passed to the function call
     * @property {Expected} expected The expected result of the function call
     * @property {boolean} expectException Expect callback to throw exception
     */

    /**
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Expected Type of expected output
     * @template {*} ExceptionExpected Type of expected output on exception
     * @typedef {Check<Input,Expected> | Check<Input,ExceptionExpected>} CheckUnion A union of Checks with same input type but different expected types for exceptions
     */

    /**
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Actual Type of actual output
     * @template {*} Expected Type of expected output
     * @template {*} ExceptionExpected Type of expected output on exception
     * @typedef {Object} InstanceFunctionTest A log of a class function to test against given checks
     * @property {string} name Name of the class function
     * @property {Array<CheckUnion<Input,Expected,ExceptionExpected>>} checks Checks to perform on the function
     * @property {CheckFunctionCall<Input,Actual,Expected>} checkFunction Function to evaluate checks
     * @property {CheckFunctionCall<Input,Actual,ExceptionExpected>} [throwCheckFunction] Function to evaluate checks on an Exception
     * @property {boolean} [parallelize] Wether to run the tests in parallel as opposed to sequentially. WARNING: async functions await per iteration if processed sequentially.
     */

    /**
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Actual Type of actual output
     * @template {*} Expected Type of expected output
     * @template {*} ExceptionExpected Type of expected output on exception
     * @typedef {Object} ClassFunctionTest A log of a class function to test against given checks
     * @property {string} name Name of the class function
     * @property {CheckFunctionCall<Input,Actual,Expected>} checkFunction Function to evaluate checks
     * @property {Array<Input>} inputs Inputs for the checks
     * @property {Array<Array<Expected>>} expecteds Expecteds per instance created for the checks
     * @property {Array<Array<ExceptionExpected>>} [exceptionExpecteds] Expecteds per instance created for the checks expecting throws
     * @property {CheckFunctionCall<Input,Actual,ExceptionExpected>} [throwCheckFunction] Function to evaluate checks on an Exception
     * @property {boolean} [parallelize] Wether to run the tests in parallel as opposed to sequentially. WARNING: async functions await per iteration if processed sequentially.
     */
    

    /**
     * Build a check from its parts
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Expected Type of expected output
     * @param {Input} input 
     * @param {Expected} expected 
     * @param {boolean} [expectThrow] 
     * @returns {Check<Input,Expected>}
     */
    static buildCheck(input,expected,expectThrow = false) {
        return {input:input??[],expected:expected,expectException:expectThrow}
    }

    /**
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Expected Type of expected output
     * @template {*} ExceptionExpected Type of expected output
     * @param {Array<Input>} inputs 
     * @param {Array<Expected>} expecteds 
     * @param {Array<ExceptionExpected>} [throwExpecteds] 
     * @returns {Array<CheckUnion<Input,Expected,ExceptionExpected>>}
     */
    static buildMultipleChecks(inputs,expecteds,throwExpecteds = []) {
        /** @type {Array<CheckUnion<Input,Expected,ExceptionExpected>>} */
        const expectedChecks = expecteds.map((e,i)=>this.buildCheck(inputs[i],e));
        const throwExpectedChecks = throwExpecteds.map((e,i)=>this.buildCheck(inputs[i+expecteds.length],e,true));
        
        return expectedChecks.concat(throwExpectedChecks);
    }

    
    

    /**
     * Create a display for the given error messages
     * @param {Array<string | null>} errorMessages List of errors to display, nulls are counted as success but not displayed
     * @param {Array<string>} ids List of ids for the given error
     * @param {string} title Title of the display
     * @param {HTMLElement} container Container of the display
     * @return {boolean} All tests were successful 
     */
    static buildTestDisplay(errorMessages, ids, title, container) {
        
        
        var successes = 0;
        for (let i = 0; i < errorMessages.length; i++) {
            const message = errorMessages[i];
            if(message) {
                this.buildErrorDisplay(ids[i],message,container)
            } 
            else if(message === null) successes++;
        }
        const titleElement = BUILD.element("h2","test_title",DOMOptions.first(container));
        titleElement.innerHTML = `${title}: ${successes} of ${errorMessages.length} tests passed`
        const allPassed = successes == errorMessages.length;
        container.classList.add(allPassed? "succeeded" : "failed")

        return allPassed;

    }

    /**
     * Display given error inside the given container
     * @param {string} id Test identifier 
     * @param {string} message Error message 
     * @param {HTMLElement} container Container to build display on 
     */
    static buildErrorDisplay(id,message,container) {
        const errorDisplay = BUILD.element("li","failed",DOMOptions.first(container));
        errorDisplay.innerHTML = `(${id}): ${message}`;
    }

    


    /* ----------------------------------------------------------------------------------------------------
    Test calls
    ---------------------------------------------------------------------------------------------------- */
    
    /**
     * Test the callback function with the given check
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Actual Type of actual output
     * @template {*} Expected Type of expected output
     * @param {(...args:Input)=>Actual|Promise<Actual>} callback
     * @param {CheckFunctionCall<Input,Actual,Expected>} checkFunction
     * @param {Check<Input,Expected>} completeCheck Inputs expected and wether to expectThrow
     * @param {HTMLElement} container Container of test display
     * @param {number} i Index of check
     * @returns {Promise<string | null>}
     */
    static async check(callback, checkFunction, {input, expected, expectException: expectThrow}, container, i) {
        try {
            const actual = await callback(...input);
            return expectThrow ? "Expected Error but received: " + actual : await checkFunction(actual,expected,input,container,i);
        } catch (error) {
            try {
                return expectThrow ?  await checkFunction(error,expected,input,container,i) : error + "";
            } catch (error) {
                return error + "";   
            }
        }
    }

    /**
     * Test the callback function with the given inputs sequentially. 
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Actual Type of actual output
     * @template {*} Expected Type of expected output
     * @template {*} ExceptionExpected Type of expected output on exception
     * @param {(...args:Input)=>Actual|Promise<Actual>} callback Callback to test
     * @param {Array<CheckUnion<Input,Expected,ExceptionExpected>>} checks Checks to test against the callback
     * @param {CheckFunctionCall<Input,Actual,Expected>} checkFunction Callback to check result of callback against expected
     * @param {CheckFunctionCall<Input,*, ExceptionExpected>} [throwCheckFunction] Callback to check errors against expected
     * @param {boolean} [parallelize] Wether to run the tests in parallel as opposed to sequentially. WARNING: async functions await per iteration if processed sequentially.
     * @param {Element} [parent] Container of test display
     * @param {(input:Input)=>string} ider Callback to conver inputs to strings to identify test checks
     * @returns {Promise<boolean>}
     */
    static async function(callback, checks, checkFunction, throwCheckFunction = ()=>null, parallelize = false, parent = document.body, ider = (input)=> typeof input === "object"? input.toString() : input +"") {
        const container = BUILD.element("div","test",DOMOptions.append(parent));

        
        const errorPromises = []
        for (let i = 0; i < checks.length; i++) {
            const errorMessage = checks[i].expectException ? 
                Test.check(callback,throwCheckFunction,/** @type {Check<Input,ExceptionExpected>} */(checks[i]),container,i) :
                Test.check(callback,checkFunction,/** @type {Check<Input,Expected>} */(checks[i]),container,i)
            if(parallelize) await errorMessage;
            errorPromises.push(errorMessage)
        }
        const errorMessages = await Promise.all(errorPromises);
        
        

        return this.buildTestDisplay(errorMessages,checks.map(({input})=>ider(input)),`TESTING ${callback.name}`,container)
    }

    

    /**
     * @template {Array<*>} Input Type of input parameters
     * @template {Object} Actual Type of actual output
     * @template {*} Expected Type of expected output
     * @param {Actual} instance Instance to test
     * @param {Check<Input,Expected>} check Input used to create instance and expected value to pass to construction checker
     * @param {CheckFunctionCall<Input,Actual, Expected>} testConstruction Function to check the construction of the instance
     * @param {Array<InstanceFunctionTest<Array<*>,*,*,*>>} functionTests Checks against the instance's functions
     * @param {boolean} [parallelize] Wether to run the tests in parallel as opposed to sequentially. WARNING: async functions await per iteration if processed sequentially.
     * @param {HTMLElement} [parent] Container of test display
     * @param {number} [index] Index of the instance created(used mainly in Test.class)
     * @return {Promise<boolean>}
     */
    static async instance(instance, {expected, input}, testConstruction, functionTests, parallelize = false, parent = document.body,index) {
        const container = BUILD.element("div","test",DOMOptions.append(parent));
        const title = `TESTING INSTANCE OF ${instance["constructor"].name}${index!=null?`(${index})`:""}`;

        const errorMessages = [];
        const errorIds = []
        try {
            errorMessages.push(await testConstruction(instance,expected,input,container,index))
        } catch (error) {
            errorMessages.push(error + "")
        }
        if(errorMessages.length>0) errorIds.push("CONSTRUCTION");


        const errorPromises = []
        for (const test of functionTests) {
            if(typeof instance[test.name] != "function") {}
            const errorMessage = Test.function(instance[test.name].bind(instance),test.checks,test.checkFunction,test.throwCheckFunction,test.parallelize??false,container);
            if(parallelize) await errorMessage;
            errorPromises.push(errorMessage)
        }
        const results = await Promise.all(errorPromises)
        for (const result of results) {
            errorMessages.push(result?null:"");
            if(result)   {
                errorIds.push("")
            }
        }

        return this.buildTestDisplay(errorMessages,errorIds,title,container)
    }


    /**
     * Test a class, construction of its instances and their functions.
     * @template {Array<*>} Input Type of input parameters
     * @template {*} Actual Type of actual output
     * @template {*} Expected Type of expected output
     * @template {*} ExceptionExpected Type of expected output on exception
     * @param {new (...args: Input) => Actual} constructor Class to test
     * @param {Array<CheckUnion<Input,Expected,ExceptionExpected>>} checks Checks to test on class, each check represents an instance
     * @param {CheckFunctionCall<Input, Actual, Expected>} testConstruction Function to check the construction of the instances
     * @param {CheckFunctionCall<Input, Actual, ExceptionExpected>} [testThrow] Function to check an exception thrown during construction of the instances
     * @param {Array<ClassFunctionTest<Array<*>,*,*,*>>} [functionTests] Checks against each instance's functions
     * @param {boolean} [parallelize] Wether to run the tests in parallel as opposed to sequentially. WARNING: async functions await per iteration if processed sequentially.
     * @param {HTMLElement} [parent] 
     */
    static async class(constructor, checks, testConstruction, testThrow = ()=>null, functionTests = [], parallelize = false, parent = document.body) {

        
        return await Test.function(
            (...inp)=> new constructor(...inp),
            checks,
            async (actual, expected, input, parent,index)=>{
                /** @type {Array<InstanceFunctionTest<Array<*>,*,*,*>>} */
                const instanceTests = functionTests.map((test)=>{
                    return {
                        checks:Test.buildMultipleChecks(
                            test.inputs,
                            test.expecteds[/** @type {number}*/(index)],
                            test.exceptionExpecteds?test.exceptionExpecteds[/** @type {number}*/(index)]:[]
                        ),
                        checkFunction:test.checkFunction,
                        throwCheckFunction:test.throwCheckFunction,
                        name:test.name,
                        parallelize:test.parallelize
                    }
                })
                return (await Test.instance(actual,Test.buildCheck(input,expected),testConstruction,instanceTests,parallelize,parent,index)) ? null : ""
            },
            testThrow,
            parallelize,
            parent
        )
    }

    /* ----------------------------------------------------------------------------------------------------
    Default checks
    ---------------------------------------------------------------------------------------------------- */

    /**
     * Checks that actual and expected are equal using the === operator
     * @template {string | number} T
     * @type {CheckFunctionCall<*, T, T>}
     */
    static isEqual(actual, expected) {
        if(actual === expected) return null
        return `Expected {${actual}} to be {${expected}}`
    }


    
    /**
     * Check that objects are deeply equal
     * @type {CheckFunctionCall<*,Object.<string,*>, Object.<string,*>>}
     */
    static isDeepEqual(actual, expected) {
        for (const key in expected) {
            if(!(key in actual)) return "Actual is missing key: " + key
            const expectedType = typeof expected[key]
            if(typeof actual[key] != expectedType) return `Type mismatch: ${key} should be ${expectedType} but is ${typeof actual[key]}`
            const error =expectedType == "object"? Test.isDeepEqual(actual[key],expected[key])
                                                    : Test.isEqual(actual[key],expected[key])
            if(error) return error
        }
        return null
    }

    /**
     * Check that two arrays are equal in any order
     * @template {*} T
     * @type {CheckFunctionCall<*, Array<T>, Array<T>>}
     */
    static isEqualDisordered(actual, expected) {
        const actual_clone = [...actual];
        const missing = [];

        if(actual_clone.length != expected.length) return "Arrays have different lengths.";
        for (let i = 0; i < expected.length; i++) {
            const indexInActual = actual_clone.indexOf(expected[i]);
            if(indexInActual < 0) missing.push(expected[i]);
            else actual_clone.splice(indexInActual,1);
        }
        if(missing.length || actual_clone.length) {
            return `Missing: ${missing}<br> Surplus: ${actual_clone}`;
        }
        
        return null;
    }
}
