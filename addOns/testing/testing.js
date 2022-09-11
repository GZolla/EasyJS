// @ts-check
import { Dropdown, NavBar } from "../displays/displays.js";
import * as Build from "../../base/build.js";
import { DOMOption, DOMOptions} from "../../base/dom.js";
import {loadCSS} from "../../base/css.js"
import {PATH_TO_EJS} from "../../settings.js"
loadCSS("testCss",PATH_TO_EJS + "addOns/testing/index.css");

/** 
 * A unit testing framework
 * @module Testing
 */

/**
 * @template {*[]} Input The type of the input paramaters, expressed as an array
 * @template {*} Actual The type of the output of the callback
 * @class
 */
export class Test {
    /** @type {TestCallback} */ callback;
    /** @type {boolean} */ parallelize;
    /** @type {Array<TestCase<Input,any>>} */ lastCases;
    /** @type {Dropdown | null} */ dropdown = null;

    /**
     * Set up a test
     * @param {TestCallback} callback Callback to test 
     * @param {boolean} parallelize Run tests in parallel or sequentially
     */
     constructor(callback, parallelize = false) {
        this.callback = callback;
        this.parallelize = parallelize;    
    }

    /**
     * @returns {function} Function from which to extract name and parameters
     */
    getActualCallback() {
        return this.callback;
    }


    /**
     * 
     * @returns {number}
     */
    countSuccess() {
        return this.lastCases.reduce(
            (total,{errorMessage}) => total + (errorMessage === null ? 1:0),
            0
        )
    }

    /* ----------------------------------------------------------------------------------------------------
    Types
    ---------------------------------------------------------------------------------------------------- */

    /**
     * @typedef {(...args: Input)=>Actual} TestCallback Callback to test
     */

    /**
     * @template {*[]} Input The type of the input paramaters, expressed as an array
     * @template {*} Actual The type of the output of the callback
     * @template {*} Expected The type of the expected value
     * @template {*} [This=unknown]
     * @this This
     * @callback Checker A function to compare the actual output of a callback against the given expected
     * @param {Actual} actual The actual ouput of the callback
     * @param {Expected} expected The expected value to compare against
     * @param {Input} input The input used to obtain 'actual'
     * @param {number} [index] The index of a testcase if run with multiple
     * @return {string | null | Promise<string | null>}
     */

    /**
     * @template {*[]} Input The type of the input paramaters, expressed as an array
     * @template {*} Expected The type of the expected value
     * @typedef {Object} TestCase
     * @property {Input} input Input parameters as an array
     * @property {Expected} expected Expected value for checker function
     * @property {string} [id] Id of testcase
     * @property {string | null} [errorMessage] Error message resulting from checking the test case, or null if test succeeded
     */

    /**
     * @template {*[]} Input
     * @callback Ider
     * @param {Input} input
     */

    /* ----------------------------------------------------------------------------------------------------
    Test Runners
    ---------------------------------------------------------------------------------------------------- */

    /**
     * Run a test against the set callback
     * @template {*} Expected The type of the expected value
     * @param {TestCase<Input,Expected>} check
     * @param {Checker<Input,Actual,Expected>} checkFunction Checker of actual result
     * @param {boolean} [expectException] Wether the callback should throw error on the given inputs
     * @param {number} [index] Index of the test if run with others
     * @return {Promise<string | null>} Error message resulting from checking the test case, or null if test succeeded
     */
    async runTest({input, expected}, checkFunction, expectException = false, index) {
        try {
            const actual = await this.callback(...input);
            return expectException ? "Expected Error but received: " + actual : await checkFunction(actual,expected,input,index);
        } catch (error) {
            try {
                return expectException ?  await checkFunction(error,expected,input,index) : error + "";
            } catch (error) {
                return error + "";   
            }
        }
    }

    /**
     * Run multiple tests against the callback
     * @template {*} Expected The type of the expected value
     * @param {Array<TestCase<Input,Expected>>} cases Test Cases to run against check
     * @param {Checker<Input, Actual,Expected>} checkFunction Checker of actual result
     * @param {boolean} [expectException] Wether the callback should throw error on the given inputs
     * @param {Ider<Input>} [ider] Function to id test cases using their inputs if no id is given.
     * @return {Promise<Array<string | null>>} Error messages from each test case, or null for succesful tests
     */
    async runTests(cases, checkFunction, expectException = false, ider = (inp)=>inp+"") {    
        const errorPromises = []
        for (const check of cases) {
            if(!("id" in check)) check.id = ider(check.input)
            const errorMessage = this.runTest(check,checkFunction,expectException);
            if(!this.parallelize) await errorMessage;
            errorPromises.push(errorMessage)
        }
        const errors =await Promise.all(errorPromises)

        for (let i = 0; i < cases.length; i++) {
            cases[i].errorMessage = errors[i];
        }
        this.lastCases = cases;
        return errors;
    }

    /* ----------------------------------------------------------------------------------------------------
    Default checks
    ---------------------------------------------------------------------------------------------------- */

    /**
     * Checks that actual and expected are equal using the === operator
     * @template {*} T
     * @type {Checker<any, T,T>}
     */
     static isEqual(actual, expected) {
        if(actual === expected) return null
        return `Expected {${actual}} to be {${expected}}`
    }


    
    /**
     * Check that objects are deeply equal
     * @type {Checker<*,Object.<string,*>, Object.<string,*>>}
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
     * @type {Checker<*, Array<T>, Array<T>>}
     */
    static isEqualDisordered(actual, expected) {
        const actual_clone = [...actual];
        const missing = [];

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

    /**
     * Just pass
     * @type {Checker<*, *, *>}
     */
    static pass() {
        return null;
    }

    /* ----------------------------------------------------------------------------------------------------
    Displaying
    ---------------------------------------------------------------------------------------------------- */

    static STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    static DEFAULT_ARGUMENTS = /(=([^,]+),)/g;
    static LAST_ARGUMENT = /(=.*$)/

    /**
     * Get the callback parameter names
     * @returns {string[]}
     */
    getParamNames() {
        var fnStr = this.getActualCallback().toString().replace(Test.STRIP_COMMENTS, '');
        const paramString = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).replace(Test.DEFAULT_ARGUMENTS,",").replace(Test.LAST_ARGUMENT,"");
        var result = paramString.split(",").map((s)=>s.trim());

        if(result === null)
            result = [];
        return result;
    }

    /**
     * Create a display for the given error messages
     * @template {*} Expected The type of the expected value
     * @param {Array<TestCase<Input,Expected>>} cases Test Cases run to get the errors
     * @param {string} [title] Title of the display
     * @param {HTMLElement} [parent] Container of the display
     * @return {Dropdown} The dropdown display
     */
    displayCases(cases = this.lastCases, title, parent = document.body) {
        const dropdown = new Dropdown("",{className:"test",option:DOMOptions.append(parent)})

        var successes = 0;
        for (const testCase of cases) {
            dropdown.content.appendChild(this.buildCaseDisplay(testCase))
            if(testCase.errorMessage === null) successes++;
        }
        dropdown.changeTitle(`${title??this.getActualCallback().name}: ${successes} of ${cases.length} test cases passed`)

        const allPassed = successes == cases.length;
        dropdown.container.classList.add(allPassed? "succeeded" : "failed")
        
        return dropdown;

    }



    /**
     * Display given error inside the given container
     * @template {*} Expected The type of the expected value
     * @param {TestCase<Input,Expected>} testCase Test identifier 
     */
    buildCaseDisplay(testCase) {
        const errorDisplay = Build.element("span","test-case " + (testCase.errorMessage != null?"failed":"succeeded"));
        const idContainer = Build.element("b","test-case-id",DOMOptions.append(errorDisplay))
        idContainer.innerHTML = testCase.id?testCase.id:""

        const msContainer = Build.element("span","test-case-message",DOMOptions.append(errorDisplay))
        msContainer.innerHTML = testCase.errorMessage != null ? testCase.errorMessage : "Success";

        return errorDisplay;
    }

}


/**
 * Test for a class
 * @template {*[]} Input The type of the input paramaters, expressed as an array
 * @template {*} Actual The type of the output of the callback
 * @extends {Test}
 */
export class ClassTest extends Test {

    



    /** @type {new (...args: Input)=>Actual} */ Constructor;
    /** @type {Actual[]} */ instances = [];
    /** @type {Object<string,Array<Test<any,any>>>} */ lastFunctionTests = {};
    /** @type {NavBar} */ navbar;

    /**
     * Set up a test for a class
     * @param {new (...args: Input)=>Actual} Constructor Class to test
     * @param {boolean} [parallelize] Run tests in parallel or sequentially
     */
    constructor(Constructor, parallelize = false) {
        super(
            (...inp)=> new Constructor(.../**@type {Input}*/(inp)),
            parallelize
        )
        this.Constructor = Constructor;
    }

    
    /**
     * @overrides
     * @returns {function}
     */
    getActualCallback() {
        return this.Constructor;
    }


    /**
     * Run multiple test cases agaisnt the class
     * @overrides
     * @template {*} Expected The type of the expected value
     * @param {Array<TestCase<Input,Expected>>} cases Test Cases to run against check
     * @param {Checker<Input, Actual,Expected>} checkFunction Checker of actual result
     * @param {boolean} [expectException] Wether the callback should throw error on the given inputs
     * @param {Ider<Input>} [ider] Function to id checks using their inputs if no id.
     * @return {Promise<Array<string | null>>}
     */
     async runTests(cases, checkFunction, expectException = false, ider = (inp)=>inp+"") {
        this.instances = [];
        this.lastFunctionTests = {};
        return super.runTests(cases,async (actual, expected,input,index)=>{
            const result = await checkFunction(actual,expected,input,index);
            if(result === null) this.instances.push(actual);
            return result
        },expectException,ider)
    }

    /**
     * Run multiple tests against the callback and generate
     * @overrides
     * @template {*[]} FunctionInput The type of functions the input paramaters, expressed as an array
     * @template {*} FunctionActual The type of the output of the function
     * @template {*} FunctionExpected The type of the expected value for the checker
     * @param {string} name The name of the function
     * @param {Object[]} checks
     * @param {FunctionInput} checks[].input Inputs of test
     * @param {FunctionExpected[]} checks[].expecteds Expected outputs of test
     * @param {Checker<FunctionInput, FunctionActual, FunctionExpected,Actual>} checkFunction Checker of actual result
     * @param {boolean} [expectException] Wether the callback should throw error on the given inputs
     * @param {boolean} [parallelize] Parallelize the tests or run sequentially
     * @return {Promise<Array<Array<string | null>>>}
     */
    async runInstanceTests(name, checks, checkFunction, expectException = false, parallelize = false) {
        const messages = [];
        this.lastFunctionTests[name] = []
        for (let i = 0; i< this.instances.length;i++) {
            const instance = this.instances[i];
            const func = instance[name];
            if(typeof func != "function") throw new Error(`${name} is not a function inside instance of ${this.Constructor.name}`);

            /** @type {Test<FunctionInput,FunctionActual>} */
            const instanceCheck = new Test(func.bind(instance),parallelize);
            this.lastFunctionTests[name].push(instanceCheck);

            const results = instanceCheck.runTests(checks.map(({input,expecteds})=>{
                return {input:input,expected:expecteds[i]};
            }),checkFunction.bind(instance),expectException);
            if(!this.parallelize) await results;
            messages.push(
                results
            )
        }
        return Promise.all(messages);
    }

    /* ----------------------------------------------------------------------------------------------------
    Display
    ---------------------------------------------------------------------------------------------------- */

    static CONTAINER_CLASS = "test-function-container"
    /**
     * Create a display for the given error messages
     * @template {*} Expected The type of the expected value
     * @param {Array<TestCase<Input,Expected>>} cases Test Cases run to get the errors
     * @param {string} [title] Title of the display
     * @param {HTMLElement} [parent] Container of the display
     * @return {Dropdown} The dropdown display
     */
    displayErrors(cases = this.lastCases, title, parent = document.body){
        const dropdown = new Dropdown("",{className:"test",option:DOMOptions.append(parent)})
        dropdown.content.classList.add("test-class");
        const appendToContent = DOMOptions.append(dropdown.content)

        const construction = Build.element("div",ClassTest.CONTAINER_CLASS)
        var successes = 0;
        for (const testCase of cases) {
            construction.appendChild(this.buildCaseDisplay(testCase))
            if(testCase.errorMessage === null) successes++;
        }

        
        this.navbar = new NavBar(Build.element("nav","test-navigation",appendToContent));
        const constructionPassing = this.addFunctionDisplay("Construction",successes,this.lastCases.length,construction,appendToContent)
        this.navbar.open(Object.keys(this.navbar.elements)[0])
        
        let functionPassing = 0
        let functionCount = 0;
        for (const name in this.lastFunctionTests) {
            const container = Build.element("div",ClassTest.CONTAINER_CLASS)
            
            let passing = 0;
            for (let i = 0; i < this.lastFunctionTests[name].length; i++) {
                const test = this.lastFunctionTests[name][i];
                const testDropdown = test.displayCases(undefined,this.lastCases[i].id,container);
                if(testDropdown.container.classList.contains("succeeded")) passing ++;
            }

            const passed = this.addFunctionDisplay(name,passing,this.lastFunctionTests[name].length,container,appendToContent)
            if(passed) functionPassing++;
            functionCount++;
        }

        dropdown.changeTitle(
            `${title??this.getActualCallback().name}: Construction ${constructionPassing?"passing":"failing"}`
            + (functionCount > 0 ? `,${functionPassing} of ${functionCount} functions passed` : "")
        )
        dropdown.container.classList.add(constructionPassing && functionCount == functionPassing ?"succeeded":"failed");


        return dropdown
    }

    /**
     * Add a function test to the display
     * @param {string} name 
     * @param {number} successes 
     * @param {number} total 
     * @param {HTMLElement} element
     * @param {DOMOption} appendToContent
     * @returns {boolean} Passed all
     */
    addFunctionDisplay(name, successes, total, element, appendToContent) {
        const header = `${name}(${successes}/${total})`
        this.navbar.add(header,element,appendToContent)
        const passing = successes == this.lastCases.length
        this.navbar.elements[header].li.classList.add(passing?"ejs-li-success":"ejs-li-fail")
        return passing
    }



}



