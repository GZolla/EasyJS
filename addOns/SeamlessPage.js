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
    /**@type {Object.<string, State>?} */ static states = null;
    /**@type {function}  */ static reset = ()=>{};

    
    /**
     * Set the SeamlessPage with the given states, reset function and initial state
     * @param {Object.<string,State>} states A map of state keys and their rendering functions;
     * @param {string} initState The initial state to load(Won't create a history navigation)
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
     * If states are not set or stateKey is invalid, throw error, otherwise return State
     * @param {string} stateKey 
     * @returns {State} State of given key
     */
    static checkStateValidity(stateKey) {
        if(this.states == null) throw new Error("States has not been set, call set() to do so.");
        if(!(stateKey in this.states)) throw new Error("Invalid State, given key must be in set states");
        return this.states[stateKey];
    }

    /**
     * Load stateKey
     * @param {string} stateKey The key of the state to load
     * @param {boolean} navigate Wether the loading should create a state in the history
     */
    static loadState(stateKey, navigate = true) {
        const state = this.checkStateValidity(stateKey);
        window.history[navigate ? "pushState" : "replaceState"]({stateKey:stateKey},"",state.url)
        
        this.renderState(stateKey)
    }

    /**
     * Run reset and then the renderer callback of the given stateKey
     * @param {string} stateKey The key of the state to render
     */
    static renderState(stateKey) {
        const state = this.checkStateValidity(stateKey);
        this.reset();
        state.renderer();
    }

    
}