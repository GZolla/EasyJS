// @ts-check

/**
 * @typedef {Object} State
 * @property {string} url
 * @property {function} renderer
 */


/**
 * A seamless page loader
 */
export default class SeamlessPage {
    /**@type {Object.<string, State>} */ static states = null;
    /**@type {function}  */ static reset = null;

    
    /**
     * 
     * @param {Object.<string,State>} states A map of state keys and their rendering functions;
     * @param {string} initState The initial state to load
     * @param {function} resetCallback The callback to run whenever a new state is rendered
     */
    static set(states, initState, resetCallback) {
        if(this.states == null) {
            window.onpopstate = this.handlePop;
        }
        this.states = states;
        this.reset = resetCallback;
        this.loadState(initState,false);

    }

    /**
     * Loads state of given PopStateEvent
     * @param {PopStateEvent} e 
     */
    static handlePop(e) {
        this.loadState(e.state.stateKey);
    }

    /**
     * if stateKey is invalid, throw error
     * @param {string} stateKey 
     */
    static checkStateValidity(stateKey) {
        if(!(this.states && stateKey in this.states)) throw new Error("Invalid State, given key must be in states");
    }

    /**
     * Load stateKey
     * @param {string} stateKey The key of the state to load
     * @param {boolean} navigate Wether the loading should create a state in the history
     */
    static loadState(stateKey, navigate = true) {
        this.checkStateValidity(stateKey);
        window.history[navigate ? "pushState" : "replaceState"]({stateKey:stateKey},"",this.states[stateKey].url)
        
        this.renderState(stateKey)
    }

    /**
     * Run reset and then the renderer callback of the given stateKey
     * @param {string} stateKey The key of the state to render
     */
    static renderState(stateKey) {
        this.checkStateValidity(stateKey);
        this.reset();
        this.states[stateKey].renderer();
    }

    
}