// @ts-check
import {API} from "../../addOns/API.js"
import Test from "../../addOns/Test.js"

/* ----------------------------------------------------------------------------------------------------
Imported Types: Change if support ever
---------------------------------------------------------------------------------------------------- */


/**
 * @callback ObjectCallback Callback that takes an object as only parameter
 * @param {Object.<string,*>} param
 */

/**
 * @typedef {Object} LoadingData
 * @property {ObjectCallback} renderer
 * @property {Object.<string,*>} render_param
 * @property {ObjectCallback} derenderer
 * @property {Object.<string,*>} derender_param
 */

/**
 * @typedef {('POST'|'PUT'|'DELETE'|'GET')} RESTMethod
 */

/**
 * @typedef {Object} RequestBody
 * @property {RESTMethod} method
 * @property {string} body
 * @property {RequestHeader} headers
 * @property {RequestCredentials} credentials
 */

/**
 * @typedef {Object} RequestHeader
 * @property {string} `Content-Type`
 * @property {string} `X-CSRFToken` 
 */

/**
 * @callback ResponseCallback Callback that takes a promise of an API request
 * @param {Promise.<Object.<string,string> | {}>} promise
 */

// Test.js

/**
 * @template {*[]} Input Type of input parameters
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
 * @template {any[]} Input Type of input parameters
 * @template {any} Expected Type of expected output
 * @typedef {Object} Check An input, an expected output and wether the output is an exception
 * @property {Input} input The input parameters passed to the function call
 * @property {Expected} expected The expected result of the function call
 * @property {boolean} expectException Expect callback to throw exception
 */

/**
 * @template {any[]} Input Type of input parameters
 * @template {any} Expected Type of expected output
 * @template {any} ExceptionExpected Type of expected output on exception
 * @typedef {Check<Input,Expected> | Check<Input,ExceptionExpected>} CheckUnion A union of Checks with same input type but different expected types for exceptions
 */

/**
 * @template {*[]} Input Type of input parameters
 * @template {*} Actual Type of actual output
 * @template {*} Expected Type of expected output
 * @template {*} ExceptionExpected Type of expected output on exception
 * @typedef {Object} InstanceFunctionTest A log of a class function to test against given checks
 * @property {string} name Name of the class function
 * @property {CheckUnion<Input,Expected,ExceptionExpected>[]} checks Checks to perform on the function
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


/* ----------------------------------------------------------------------------------------------------
Tests
---------------------------------------------------------------------------------------------------- */

/**
 * @typedef {[url: string, method: RESTMethod, loading_data: LoadingData | null, id?: string | undefined]} APIInput
 */
/**@type {APIInput[]} */
const APIInputs = [
    ["https://pokeapi.co/api/v2/pokemon","GET",null,"pokeApi"],
    ["https://pokeapi.co/api/v2/pokemon","GET",null,"pokeApi"],
    ["https://pokeapi.co/api/v2/pokemon","GET",null,undefined],
    ["https://notarealpage.com","GET",null,""]
]
const APIExpecteds = [
    {id:"pokeApi"},
    {id:"pokeApi(0)"},
    {id:`${APIInputs[2][0]}:GET`},
    {id:``}
]


/**@type {Array<ClassFunctionTest<*[],*,*,*>>} */
const APIFunctionTests = [
    {
        name:"sendRequest",
        inputs:[[{limit:1}]],
        expecteds: [
            [{"count":1154,"next":"https://pokeapi.co/api/v2/pokemon?offset=1&limit=1","previous":null,"results":[{"name":"bulbasaur","url":"https://pokeapi.co/api/v2/pokemon/1/"}]}],
            [{"count":1154,"next":"https://pokeapi.co/api/v2/pokemon?offset=1&limit=1","previous":null,"results":[{"name":"bulbasaur","url":"https://pokeapi.co/api/v2/pokemon/1/"}]}],
            [{"count":1154,"next":"https://pokeapi.co/api/v2/pokemon?offset=1&limit=1","previous":null,"results":[{"name":"bulbasaur","url":"https://pokeapi.co/api/v2/pokemon/1/"}]}],
            [{"error":new Error()}]
        ],
        checkFunction:Test.isDeepEqual
    }
]



Test.class(
    API,
    Test.buildMultipleChecks(APIInputs,APIExpecteds),
    (actual, expected) => {
        const sameId = Test.isEqual(actual.id,expected.id);
        if(sameId) return sameId
        
        return null
    },
    undefined,
    APIFunctionTests
)

