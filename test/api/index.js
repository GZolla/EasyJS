// @ts-check
import {API} from "../../addOns/API.js"
import {Test,ClassTest} from "../../testing/index.js"

const APITest = new ClassTest(API,true);
await APITest.runTests(
    [
        {id:"",input:["https://pokeapi.co/api/v2/pokemon","GET",null,"pokeApi"],expected:{id:"pokeApi"}},
        {id:"",input:["https://pokeapi.co/api/v2/pokemon","GET",null,"pokeApi"],expected:{id:"pokeApi(0)"}},
        {id:"",input:["https://pokeapi.co/api/v2/pokemon","GET",null,"pokeApi"],expected:{id:"pokeApi(1)"}},
        {id:"",input:["https://pokeapi.co/api/v2/pokemon","GET",null,undefined],expected:{id:`https://pokeapi.co/api/v2/pokemon:GET`}},
    ],
    (actual, expected) => {
        return Test.isEqual(actual.id,expected.id);
    }
)
APITest.displayLastCases();

API.removeById("pokeApi")
await APITest.runTests(
    [
        {id:"",input:["https://pokeapi.co/api/v2/pokemon","GET",null,"pokeApi"],expected:{id:"pokeApi"}},
        {id:"",input:["https://notarealpage.com","GET",null,""],expected:{id:``}}
    ],
    (actual, expected) => {
        return Test.isEqual(actual.id,expected.id);
    }
)


await APITest.runInstanceTests("sendRequest",[
    {
        input:[{limit:1}],
        expecteds: [
            {"count":1154,"next":"https://pokeapi.co/api/v2/pokemon?offset=1&limit=1","previous":null,"results":[{"name":"bulbasaur","url":"https://pokeapi.co/api/v2/pokemon/1/"}]},
            {"error":new Error()}
        ]
    }
],Test.isDeepEqual)

APITest.displayLastCases();

console.log(APITest.getParamNames());