// @ts-check

// @ts-ignore
var fs = require('jsdoc/fs');
// @ts-ignore
var {prune} = require('jsdoc/util/templateHelper');
var {taffy} = require('taffydb');
// @ts-ignore
var { Tutorial} =require('jsdoc/tutorial.js');

/**
 * @typedef {Object} Meta
 * @property {string} filename
 * @property {number} lineno
 * @property {number} columnno
 * @property {string} path
 * @property {object} code
 */

/**
 * @typedef {"module" | "typedef" | "function" | "namespace" | "constant" | "class" | "member"} Kind
 */
/**
 * @typedef {Object} Members
 * @property {DocModule[]} [module]
 * @property {DocTypedef[]} [typedef]
 * @property {DocFunction[]} [function]
 * @property {DocNamespace[]} [namespace]
 * @property {DocConstant[]} [constant]
 * @property {DocClass[]} [class]
 * @property {DocMember[]} [member]
 */


/**
 * @template {Kind} [K=Kind]
 * @typedef {Object} PrimDoclet
 * @property {string} comment
 * @property {Meta} meta
 * @property {string} description
 * @property {K} kind
 * @property {string} name
 * @property {string} longname
 * @property {string} ___id
 * @property {boolean} ___s 
 * @property {string} summary
 * @property {string} [memberof]
 * @property {Members} [members]
 * @property {object | string[]} type
 * @property {string[]} type.names
 */

/**
 * @typedef {Object} TypedTag
 * @property {object | string[]} type
 * @property {string[]} type.names
 * @property {string} name
 * @property {string} description
 * @property {TypedTag[]} [properties]
 * @property {boolean} [nullable]
 * @property {boolean} [optional]
 * @property {boolean} [variable]
 * @property {string} [defaultvalue]
 */

/**
 * @typedef {Object} hasClassDesc
 * @property {string} [classdesc]
 * @typedef {Object} hasFunc
 * @property {string} [attribs]
 * @property {TypedTag[]} [params]
 * @property {string} [signature]
 * @property {string} [summary]
 * @property {string} [this]
 * @property {TypedTag | TypedTag[]} [returns]
 */

/**
 * @typedef {PrimDoclet<"module">} DocModule
 * @typedef {PrimDoclet<"class"> & hasFunc & hasClassDesc} DocClass
 * @typedef {PrimDoclet<"function"> & hasFunc} DocFunction
 * @typedef {PrimDoclet<"typedef"> & hasFunc & TypedTag} DocTypedef
 * @typedef {PrimDoclet<"namespace">} DocNamespace
 * @typedef {PrimDoclet<"constant"> & TypedTag} DocConstant
 * @typedef {PrimDoclet<"member"> & TypedTag} DocMember
 * @typedef {DocModule | DocClass | DocFunction | DocTypedef | DocNamespace | DocConstant | DocMember} Doclet
 */

//"module" | "typedef" | "function" | "namespace" | "constant" | "class" | "member"
/**
 * @typedef {Object} State
 * @property {string} url
 * @property {function} renderer
 */

/**
 * 
 * @param {TypedTag[]} items 
 */
 function moveSubprops(items) {
    const itemMap = {};
    const newItems = [];

    for (const item of items) {
        item.type = item.type.names
        if (item.name) {
            let match = null;
            for (const name of Object.keys(itemMap)) {
                const paramRegExp = new RegExp(`^(?:${name}(?:\\[\\])*)\\.(.+)$`);
                match = item.name.match(paramRegExp);
                if(match) {
                  itemMap[name].properties = itemMap[name].properties || [];
                  itemMap[name].properties?.push(item);
                  break;
                }
            }
            itemMap[item.name] = item;
            if(match) {
                item.name = match[1];
                continue;
            }
        }
        newItems.push(item);
    }

    return newItems;
}

function setAttributes(d) {
    {
        const attribs = [];

        for (const att of ["async", "generator","virtual","readonly","nullable"]) {
            if(d[att]) {
                delete d[att];
                attribs.push(att == "virtual" ? "abstract" : att);
            }
        }
    
        if (d.access && d.access !== 'public') {
            delete d["access"];
            attribs.push(d.access);
        }
    
        if (d.scope) {
            if (d.scope === "static") {
                attribs.push("static");
            }
            delete d["scope"]
        }
        if(attribs.length == 0) return;
        d.attributes = attribs;
    }
}

/**
 * 
 * @param {taffy} taffyData 
 * @param {object} opts 
 * @param {Tutorial} tutorials 
 */
exports.publish = function (taffyData, opts, tutorials) {
    /**@type {Doclet[]} */
    const modules = []
    /**@type {Object<string,Doclet>} */
    const moduleIds = {};
    prune(taffyData)().each((/** @type {Doclet} */r)=> {
        setAttributes(r);
        var rClone = {}
        for (const key of Object.keys(r).sort()) {
            rClone[key] = r[key];
        } 
        r = /** @type {Doclet} */(rClone);
        moduleIds[r.longname] = r;
        r.members = undefined
        if(r.kind == "module") {
            modules.push(r)
        } else if(r.memberof && r.memberof in moduleIds) {
            const memberof = moduleIds[r.memberof];
            if(memberof.members == null) memberof.members = {}

            if(r.type) r.type = r.type.names 
            if(r.kind == "typedef" || r.kind == "constant" || r.kind == "member") {
                if(r.properties) r.properties = moveSubprops(r.properties);
            } 
            if((r.kind == "class" || r.kind == "function" || r.kind == "typedef")) {
                const templateComments = r.comment.match(/@template[^@]*/g);
                if(templateComments) {
                    r["templates"] = [];
                    for (const tc of templateComments) {
                        const breakdown = tc.replace(/\r\n \* /g,"<br>").match(/\{([^\}]*)\} (?:\[)?([a-zA-Z_$][0-9a-zA-Z_$]*)(?:=((?:\[\]|[^\]])*)\])?(?: (.*(?:<br>.*)*))?/);
                        if(breakdown == null) continue;
                        const template = {
                            name:breakdown[2],
                            type:breakdown[1].split(/ ?\| ?/)
                        }
                        if(breakdown[4]) template["description"] = breakdown[4];
                        if(breakdown[3]) {
                            template["optional"] = true;
                            template["defaultvalue"] = breakdown[3];
                        }
                        r["templates"].push(template);
                    }
                }
                
                if(r.returns) {
                    r.returns = /** @type {TypedTag}*/(r.returns[0]);
                    r.returns.type = r.returns.type.names
                }
                if(r.params) r.params = moveSubprops(r.params);
            }
            if(!(r.kind in memberof.members)) memberof.members[r.kind] = [];
            /** @type {Array}*/(memberof.members[r.kind]).push(r);
        }
    })
    fs.writeFileSync("./doc-templates/easydoc/docs.json",JSON.stringify({
        opts:opts,
        modules:modules
    }))
};