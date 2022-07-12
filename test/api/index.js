// @ts-check
import "../index.js"
import {API} from "../../addOns/API.js"
import Test from "../../addOns/Test.js"

/* ----------------------------------------------------------------------------------------------------
Types
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
 * @template {*} Output
 * @template {*} Expected
 * @template {*[]} Input
 * @typedef {Object} InstanceFunctionTest
 * @property {string} name
 * @property {Input[]} inputs 
 * @property {Expected[]} expecteds
 * @property {ActualExpectInput<Output,Expected,Input>} check 
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
    ["https://pokeapi.co/api/v2/pokemon","GET",null,undefined]
]
const APIExpecteds = [
    {id:"pokeApi"},
    {id:"pokeApi(0)"},
    {id:`${APIInputs[2][0]}:GET`}
]
/**@type {InstanceFunctionTest<API,*,*>[]} */
const APIFunctionTests = [
    {name:"sendRequest",inputs:[
        [{limit:1}]
    ],expecteds:[
        {"count":1126,"next":"https://pokeapi.co/api/v2/pokemon?offset=1&limit=1","previous":null,"results":[{"name":"bulbasaur","url":"https://pokeapi.co/api/v2/pokemon/1/"}]}
    ],check:Test.isDeepEqual}
]



Test.class(API,APIInputs,APIExpecteds,
    (actual, expected, input, parent) => {
        const sameId = Test.isEqual(actual.id,expected.id,input,parent);
        if(sameId) return sameId
        
        return null
    },
    APIFunctionTests
)
