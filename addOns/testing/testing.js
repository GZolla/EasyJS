// @ts-check

import { Dropdown, NavBar } from "../displays/displays.js";
import { BUILD } from "../../base/build.js";
import { DOMOption, DOMOptions, removeElements } from "../../base/dom.js";
import {loadCSS} from "../../base/css.js"
import {PATH_TO_EJS} from "../../settings.js"
loadCSS("testCss",PATH_TO_EJS + "addOns/testing/index.css");

/**
 * @template {*[]} Input
 * @template {*} Actual
 * @class
 */
export class Test {
    /** @type {TestCallback} */ callback;
    /** @type {boolean} */ parallelize;
    /** @type {TestCase<Input,any>[]} */ lastCases;

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
     * @returns {function}
     */
     getActualCallback() {
        return this.callback;
    }

    /* ----------------------------------------------------------------------------------------------------
    Types
    ---------------------------------------------------------------------------------------------------- */
    /**
     * @typedef {(...args:Input) => Actual} TestCallback Callback to test
     */

    /**
     * @template {any[]} Input
     * @template {any} Actual
     * @template {any} Expected
     * @callback TestCallbackChecker 
     * @param {Actual} actual
     * @param {Expected} expected
     * @param {Input} input
     * @param {number} [index]
     * @return {string | null | Promise<string | null>}
     */

    /**
     * @template {any} Input
     * @template {any} Expected
     * @typedef {Object} TestCase
     * @property {Input} input
     * @property {Expected} expected
     * @property {string} [id]
     * @property {string | null} [errorMessage]
     */


    /* ----------------------------------------------------------------------------------------------------
    Test Runners
    ---------------------------------------------------------------------------------------------------- */

    /**
     * @template {any} Expected
     * Run a test against the set callback
     * @param {TestCase<Input,Expected>} check
     * @param {TestCallbackChecker<Input,Actual,Expected>} checkFunction Checker of actual result
     * @param {boolean} [expectException] Wether the callback should throw error on the given inputs
     * @param {number} [index] Index of the test if run with others
     * @return {Promise<string | null>}
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
     * @template {any} Expected Type of expected parameter in checkFunction
     * @param {TestCase<Input,Expected>[]} cases Test Cases to run against check
     * @param {TestCallbackChecker<Input, Actual,Expected>} checkFunction Checker of actual result
     * @param {boolean} [expectException] Wether the callback should throw error on the given inputs
     * @param {(input:Input) => string} [ider] Function to id checks using their inputs if no id.
     * @return {Promise<(string | null)[]>}
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
     * @template {any} T
     * @type {TestCallbackChecker<any, T,T>}
     */
     static isEqual(actual, expected) {
        if(actual === expected) return null
        return `Expected {${actual}} to be {${expected}}`
    }


    
    /**
     * Check that objects are deeply equal
     * @type {TestCallbackChecker<*,Object.<string,*>, Object.<string,*>>}
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
     * @type {TestCallbackChecker<*, Array<T>, Array<T>>}
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
     * @template {*} T
     * @type {TestCallbackChecker<*, Array<T>, Array<T>>}
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
     * @template {any} Expected Type of expected parameter in checkFunction
     * @param {TestCase<Input,Expected>[]} cases Test Cases run to get the errors
     * @param {string} [title] Title of the display
     * @param {HTMLElement} [parent] Container of the display
     * @return {Dropdown} All tests were successful 
     */
     displayErrors(cases, title, parent = document.body) {
         var successes = 0;
         const errorDisplays = []
         for (const testCase of cases) {
            errorDisplays.push(this.buildErrorDisplay(testCase))
            if(testCase.errorMessage === null) successes++;
         }
        const dropdown = new Dropdown(
            `${title??this.getActualCallback().name}: ${successes} of ${cases.length} test cases passed`,
            "test",
            DOMOptions.append(parent)
        )

        for (const errorDisplay of errorDisplays) {
            dropdown.content.appendChild(errorDisplay);
        }

        
        // const titleElement = BUILD.element("h2","test-title",DOMOptions.first(carrouscontainer));
        // const toggler = BUILD.element("span","toggler",DOMOptions.append(titleElement))
        // toggler.addEventListener("click",(ev)=>{
        //     /**@type {HTMLElement}*/(ev.currentTarget).parentElement?.parentElement?.classList.toggle("test-detailed")
        // })

        const allPassed = successes == cases.length;
        dropdown.container.classList.add(allPassed? "succeeded" : "failed")
        
        return dropdown;

    }

    /**
     * Display the last cases run in this test
     * @param {string} [title] 
     * @param {HTMLElement} [parent] 
     * @return {Dropdown}
     */
    displayLastCases(title, parent = document.body){
        return this.displayErrors(this.lastCases,title,parent);
    }

    /**
     * Display given error inside the given container
     * @template {any} Expected Type of expected parameter in checkFunction
     * @param {TestCase<Input,Expected>} testCase Test identifier 
     */
    buildErrorDisplay(testCase) {
        const errorDisplay = BUILD.element("span","test-case " + (testCase.errorMessage != null?"failed":"succeeded"));
        const idContainer = BUILD.element("b","test-case-id",DOMOptions.append(errorDisplay))
        idContainer.innerHTML = testCase.id?testCase.id:""

        const msContainer = BUILD.element("span","test-case-message",DOMOptions.append(errorDisplay))
        msContainer.innerHTML = testCase.errorMessage != null ? testCase.errorMessage : "Success";

        return errorDisplay;
    }

}


/**
 * Test for a class
 * @template {any[]} Input
 * @template {any} Actual
 * @extends {Test}
 */
export class ClassTest extends Test {


    /** @type {new (...args: Input) => Actual} */ Constructor;
    /** @type {Actual[]} */ instances = [];
    /** @type {Object.<string,TestContainer>} */ lastFunctionTests = {};

    /**
     * Set up a test for a class
     * @param {new (...args: Input) => Actual} Constructor Callback to test 
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
     * @typedef {object} TestContainer
     * @property {Test<any,any>[]} tests
     * @property {HTMLElement} [container]
     */

    /**
     * @override
     * @returns {function}
     */
    getActualCallback() {
        return this.Constructor;
    }


    /**
     * @overrides
     * Run multiple test cases agaisnt the class
     * @template {any} Expected Type of expected parameter in checkFunction
     * @param {TestCase<Input,Expected>[]} cases Test Cases to run against check
     * @param {TestCallbackChecker<Input, Actual,Expected>} checkFunction Checker of actual result
     * @param {boolean} [expectException] Wether the callback should throw error on the given inputs
     * @param {(input:Input) => string} [ider] Function to id checks using their inputs if no id.
     * @return {Promise<(string | null)[]>}
     */
     async runTests(cases, checkFunction, expectException = false, ider = (inp)=>inp+"") {
        this.instances = [];
        this.lastFunctionTests = {};
        return super.runTests(cases,async (actual, expected,input,index)=>{
            this.instances.push(actual);
            return checkFunction(actual,expected,input,index)
        },expectException,ider)
    }

    /**
     * Run multiple tests against the callback and generate
     * @overrides
     * @template {any[]} FunctionInput
     * @template {any} FunctionActual
     * @template {any} FunctionExpected
     * @param {string} name
     * @param {Object[]} checks
     * @param {FunctionInput} checks[].input Inputs of test
     * @param {FunctionExpected[]} checks[].expecteds Expected outputs of test
     * @param {TestCallbackChecker<FunctionInput, FunctionActual, FunctionExpected>} checkFunction Checker of actual result
     * @param {boolean} [expectException] Wether the callback should throw error on the given inputs
     * @param {boolean} [parallelize] Parallelize the tests or run sequentially
     * @return {Promise<(string | null)[][]>}
     */
    async runInstanceTests(name, checks, checkFunction, expectException = false, parallelize = false) {
        const messages = [];
        this.lastFunctionTests[name] = {
            tests:[]
        }
        for (let i = 0; i< this.instances.length;i++) {
            const instance = this.instances[i];
            // const instanceTestCases =

            if(typeof instance[name] != "function") throw new Error(`${name} is not a function inside instance of ${this.Constructor.name}`);
            /** @type {Test<FunctionInput,FunctionActual>} */
            const instanceCheck = new Test(instance[name].bind(instance),parallelize);
            this.lastFunctionTests[name].tests.push(instanceCheck);

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

    static CONTAINER_CLASS = "test-function-container"
    /**
     * @override
     * Display the last cases run in this test
     * @param {string} [title] 
     * @param {HTMLElement} [parent] 
     * @return {Dropdown}
     */
     displayLastCases(title, parent = document.body){
        const dropdown = super.displayLastCases(title,parent);

        const newContent = BUILD.element("div",dropdown.content.className + " test-class",DOMOptions.append(dropdown.container))
        const newContentOption = DOMOptions.append(newContent)

        
        const construction = dropdown.content        
        dropdown.content = newContent;
        
        construction.className = ClassTest.CONTAINER_CLASS;
        newContent.appendChild(construction)
        
        const navbar = new NavBar(BUILD.element("nav","test-navigation",newContentOption));
        navbar.add("Construction",construction,newContentOption)
        navbar.open("Construction")
        
        
        // const constructionLi = BUILD.element("li","test-function-item",navbarOption);
        // constructionLi.addEventListener("click",ClassTest.openContainer.bind(null,newContent,construction))
        // constructionLi.innerHTML = "Construction"
        for (const name in this.lastFunctionTests) {
            const container = BUILD.element("div",ClassTest.CONTAINER_CLASS)
            navbar.add(name,container,newContentOption)
            
            // this.lastFunctionTests[name].container = container
            for (let i = 0; i < this.lastFunctionTests[name].tests.length; i++) {
                const test = this.lastFunctionTests[name].tests[i];
                test.displayLastCases(this.lastCases[i].id,container);
            }
        }


        return dropdown
    }

    /**
     * 
     * @param {HTMLElement} content 
     * @param {HTMLElement} container 
     */
    static openContainer(content, container) {
        const containers = /** @type {HTMLCollectionOf<HTMLElement>} */(content.getElementsByClassName(ClassTest.CONTAINER_CLASS))
        for(const element of containers) {
            element.style.display = "none"
        }
        
        container.style.display = "block"
    }



}



