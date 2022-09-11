// @ts-check
/**
 * @module API
 */

/* ----------------------------------------------------------------------------------------------------
COOKIES
---------------------------------------------------------------------------------------------------- */

/**
 * Get cookie by name
 * @param {string} name 
 * @returns {string | null}
 */
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/* ----------------------------------------------------------------------------------------------------
API TYPES
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
 * @param {Promise.<Object.<string,string>>} promise
 */


/* ----------------------------------------------------------------------------------------------------
API
---------------------------------------------------------------------------------------------------- */

const PRINT_DATA = true // PRINT Requests and responses to console

export class API {
    /**@type {Object.<string,API>} */
    static BASES = {}

    /**
     * Construct an APIRequest
     * @param {string} url 
     * @param {RESTMethod} method
     * @param {LoadingData | null} loading_data Loading animation to render
     * @param {string} id
     */
    constructor(url, method, loading_data, id = url+":"+method) {
        this.url = url
        this.method = method

        this.id = API.getUniqueID(id)
        API.BASES[this.id] = this


        this.loading_data = loading_data
        this.active_count = 0
        this.debounce_timeout = null
    }

    /* ----------------------------------------------------------------------------------------------------
    STATIC HELPERS
    ---------------------------------------------------------------------------------------------------- */

    /**
     * Returns an id not in APIRequest.BASES
     * @param {string} id 
     * @return {string}
     */
    static getUniqueID(id) {
        var i = 0;
        var unique_id = id
        while(unique_id in API.BASES) {
            unique_id = `${id}(${i})`;
            i++;
        }
        return unique_id
    }

    /**
     * Print a header with given color
     * @param {string} header 
     * @param {string} color
     */
    static printHeader(header,color) {
        console.log(
            '%c' + header,
            "color:white;font-weight:600;font-size:1.2em;background-color:" + color
        )
    }

    /**
     * If PRINT_DATA is set to true, print a header with given color; and the data as a table
     * @param {string} header 
     * @param {string} color
     * @param {Object} data 
     */
    static printTable(header, color, data) {
        if(!PRINT_DATA) return;

        this.printHeader(header,color)
        console.table(data)
    }

    /**
     * Find request with the given id, send it with given data if found, throw error otherwise
     * @param {string} id 
     * @param {Object.<string,string>} data 
     * @return {Promise.<Object.<string,string>>}
     */
    static async sendRequestById(id,data) {
        if(!(id in this.BASES)) throw new Error("API with given id was not found")
        return await this.BASES[id].sendRequest(data);
    }

    /**
     * Find API with the given id, send request with given data if found and pass response to callback, throw error otherwise
     * @param {string} id 
     * @param {Object.<string,string>} data 
     * @param {ResponseCallback} callback
     */
    static async sendRequestByIdCallback(id,data, callback) {
        callback(this.sendRequestById(id, data) )
    }

    /**
     * Delete API with given id
     * @param {string} id 
     */
    static removeById(id){
        if(!(id in this.BASES)) throw new Error("API with given id was not found")
        delete this.BASES[id]
    }

    /* ----------------------------------------------------------------------------------------------------
    REQUEST SENDING
    ---------------------------------------------------------------------------------------------------- */

    /**
     * Get a URL to send the request
     * @param {Object.<string,string>} data 
     * @returns {string}
     */
    getRequestUrl(data) {
        if(this.method != "GET") return this.url
        var params = ""
        for (const key in data) {
            const current_param = encodeURIComponent(data[key])
            params +=key + "=" + current_param + "&"
        }
        return this.url + "?" + params.substring(0,params.length-1)
    }

    /**
     * Get the body to send the request
     * @param {Object.<string,string>} data 
     * @returns {RequestBody|{}}
     */
    getRequestBody(data) {
        if(this.method == "GET") return {}
        return {
            method:this.method,
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json',"X-CSRFToken":getCookie('csrftoken')},
            credentials: 'same-origin'
        }
    }
    /**
     * Send request with given data and return the response data
     * @param {Object.<string,string>} data
     * @return {Promise.<Object.<string,any>>}
     */
    async sendRequest(data) {
        if(this.active_count == 0 && this.loading_data) this.loading_data.renderer(this.loading_data.render_param)
        this.active_count++

        API.printTable(this.id,"#770",data)

        /** @type {Object.<String,string>} */
        let response_data = {}
        const start_ms = new Date().getTime()
        try {
            const response = await fetch(this.getRequestUrl(data), this.getRequestBody(data));
            response_data = await response.json();
            if(!response.ok) throw new Error((response_data && response_data.message) || response.status)
            const end_ms = new Date().getTime()

            API.printTable(`RESPONSE(${end_ms-start_ms}ms): ${this.id}:`,"#0A0",response_data)
        } catch (error) {
            API.printHeader(error,"#F00");
            response_data = {"error":error}
        }

        this.active_count--
        if(this.active_count == 0 && this.loading_data) this.loading_data.derenderer(this.loading_data.derender_param)

        return response_data
    }

    /**
     * Send request and pass response data to callback after delay, another call to this function cancels last call and restarts time
     * @param {Object.<string,string>} data 
     * @param {ObjectCallback} callback 
     * @param {number} delay 
     */
    sendDebouncedRequest(data,callback,delay) {
        if(this.debounce_timeout) clearTimeout(this.debounce_timeout);
        this.debounce_timeout = setTimeout(API.sendRequestByIdCallback,delay,this.id,data,callback);
    }

}