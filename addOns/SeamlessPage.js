// @ts-check
/**
 * @module SeamlessPage
 */


/**
 * @typedef {Object} State
 * @property {string} url
 * @property {function} renderer
 */

/**
 * A seamless page loader
 * @class
 */
export class SeamlessPage {
    /**@type {Object.<string, State>?} */ static states = null;
    /**@type {function}  */ static reset = ()=>{};
    /**@type {string?} */ static currentState = null;
    
    
    /**
     * Set the SeamlessPage with the given states, reset function and initial state
     * @param {Object.<string,State>} states A map of state keys and their rendering functions;
     * @param {string} initState The initial state to load(Won't create a history navigation)
     * @param {function} resetCallback The callback to run whenever a new state is rendered
     */
    static set(states, initState, resetCallback) {
        if(SeamlessPage.states == null) {
            window.onpopstate = SeamlessPage.handlePop;
        }
        SeamlessPage.states = states;
        SeamlessPage.reset = resetCallback;
        SeamlessPage.loadState(initState,false,true);

    }

    /**
     * Loads state of given PopStateEvent
     * @param {PopStateEvent} e 
     */
    static handlePop(e) {
        SeamlessPage.loadState(e.state.stateKey,false);
    }

    /**
     * If states are not set or stateKey is invalid, throw error, otherwise return State
     * @param {string} stateKey 
     * @returns {State} State of given key
     */
    static checkStateValidity(stateKey) {
        if(SeamlessPage.states == null) throw new Error("States have not been set, call set() to do so.");
        if(!(stateKey in SeamlessPage.states)) throw new Error(`Invalid State '${stateKey}', given key must be in set states`);
        return SeamlessPage.states[stateKey];
    }

    /**
     * Load stateKey
     * @param {string} stateKey The key of the state to load
     * @param {boolean} navigate Wether the loading should create a state in the history
     * @param {boolean} reload Wether the state should load even if it is current state
     */
    static loadState(stateKey, navigate = true, reload = true) {
        if(!reload && stateKey === this.currentState) return;
        const state = SeamlessPage.checkStateValidity(stateKey);
        window.history[navigate ? "pushState" : "replaceState"]({stateKey:stateKey},"",encodeURI(state.url))
        
        SeamlessPage.renderState(stateKey)
    }

    /**
     * Run reset and then the renderer callback of the given stateKey
     * @param {string} stateKey The key of the state to render
     */
    static renderState(stateKey) {
        const state = SeamlessPage.checkStateValidity(stateKey);
        this.currentState = stateKey;
        SeamlessPage.reset();
        state.renderer();
    }

    /**
     * Add a state
     * @param {string} stateKey 
     * @param {string} url
     * @param {function} renderer 
     */
    static addState(stateKey,url,renderer) {
        if(SeamlessPage.states == null) throw new Error("States have not been set, call set() to do so.");
        if(stateKey in SeamlessPage.states) throw new Error("Key already in use by another state");
        SeamlessPage.states[stateKey] = {
            url:url,
            renderer:renderer
        }
    }
    
}