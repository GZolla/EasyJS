// @ts-check


import * as Build from '../../base/build.js';
import { addMaintainHoverEvent, DOMOption, DOMOptions, removeElement } from '../../base/dom.js';
import {htmlSafe, toTitleCase, wordToTitleCase} from "../../base/string.js"
import {API} from "../../addOns/API.js";
import {SeamlessPage} from "../../addOns/SeamlessPage.js"
import {Carrousel, Dropdown} from "../../addOns/displays/displays.js"
import { positionOnMouse } from '../../base/css.js';


/* ----------------------------------------------------------------------------------------------------
Types
---------------------------------------------------------------------------------------------------- */
/**
 * @typedef {"module" | "typedef" | "function" | "namespace" | "constant" | "class" | "member"} Kind
 */
/**
 * @typedef {Object} MetaCode
 * @property {string} id
 * @property {string} name
 * @property {string} type 
 * @property {string[]} [paramnames]
 * @property {string} [value]
 */
/**
 * @typedef {Object} Meta
 * @property {[number,number]} [range] 
 * @property {string} filename
 * @property {number} lineno
 * @property {number} columnno
 * @property {string} path
 * @property {MetaCode | {}} code
 * @property {Object<string,string>} [vars]
 */
/**
 * @template {Kind} [K=Kind]
 * @typedef {Object} DocletBase
 * @property {string} ___id
 * @property {boolean} ___s 
 * @property {string} comment
 * @property {string} [description]
 * @property {K} kind
 * @property {string} longname
 * @property {Meta} meta
 * @property {string} name
 * @property {Members} [members]
 * @property {string} memberof
 * @property {string[]} [attributes]
 * @property {string} [summary]
 */
/**
 * @typedef {Object} Members
 * @property {DocModule[]} module
 * @property {DocTypedef[]} typedef
 * @property {DocFunction[]} function
 * @property {DocNamespace[]} namespace
 * @property {DocConstant[]} constant
 * @property {DocClass[]} class
 * @property {DocMember[]} member
 */
/**
 * @typedef {typeTagBase & hasTypeProps} TypedTag
 */
/**
 * @typedef {Object} isFunction
 * @property {TypedTag[]} [params]
 * @property {TypedTag} [returns]
 * @property {string} [this]
 * @property {string[]} [tags]
 * @property {TypedTag[]} [templates]
 * @typedef {Object} hasTypeProps
 * @property {string[]} type
 * @property {TypedTag[]} [properties]
 * @typedef {Object} typeTagBase
 * @property {string} name
 * @property {string} [description]
 * @property {string} [defaultvalue]
 * @property {boolean} [optional]
 * @property {boolean} [nullable]
 * @property {boolean} [variable]
 * @typedef {Object} isClass
 * @property {string} classdesc
 * @property {string[]} augments
 */
/**
 * @typedef {DocletBase<"module">} DocModule
 * @typedef {DocletBase<"namespace">} DocNamespace
 * @typedef {DocletBase<"typedef"> & isFunction & hasTypeProps} DocTypedef
 * @typedef {(DocletBase<"function"> & isFunction) | (DocletBase<"function"> & hasTypeProps)} DocFunction
 * @typedef {DocletBase<"constant"> & hasTypeProps} DocConstant
 * @typedef {DocletBase<"class"> & isClass & isFunction} DocClass
 * @typedef {DocletBase<"member"> & hasTypeProps} DocMember
 */
/** @typedef {DocModule | DocNamespace | DocTypedef | DocFunction | DocConstant | DocClass | DocMember} Doclet */


/** @type {Kind[]} */
const kinds = ["module", "typedef", "constant","member", "function", "namespace", "class"];


/* ----------------------------------------------------------------------------------------------------
Generate Docs
---------------------------------------------------------------------------------------------------- */
const main = document.getElementsByTagName("main")[0]
const navCarrousel = new Carrousel([],true);
const nav = document.getElementsByTagName("nav")[0]

const docs = await new API("docs.json","GET",null).sendRequest({});
const OPTIONS = docs["opts"];


SeamlessPage.set({
  "home":{url:"",renderer:()=>{main.innerHTML = OPTIONS["readme"]}}
},"home",()=>{main.innerHTML = ""})

for (const module of docs["modules"]) buildMemberNavs(module,DOMOptions.append(nav))



/* ----------------------------------------------------------------------------------------------------
Helpers
---------------------------------------------------------------------------------------------------- */




/**
 * @param {Doclet} member
 * @param {DOMOption} option
 * @param {Dropdown} [parent]
 */
function buildMemberNavs(member, option, parent) {
    const {name, longname, members, kind} = member;

    if(!members) {
        const li = Build.element("li","nav-item",option);
        li.innerHTML = htmlSafe(name)
        li.addEventListener("click", goTo.bind(null,member))
    } else {
        SeamlessPage.addState(htmlSafe(longname),"",renderPage.bind(null,member))
        const drpdwn = new Dropdown(
          name,
          {
            className:"nav-drpdwn",
            option:option,
            carrousel:navCarrousel,
            parent:parent,
            onOpen:goTo.bind(null,member)
          }
        );
        const contOption = DOMOptions.append(drpdwn.content);
        for(const k  of kinds)
            if(members && k in members && members[k].length) {
              Build.element("div","nav-header",contOption).innerHTML = toTitleCase(k + (k=="class"?"es":"s"));
              for (const m of members[k]) buildMemberNavs(m,contOption,drpdwn);
            };
    }

}

/**
 * Render given module
 * @param {Doclet} module
 */
function renderPage(module) {
    const {name, members} = module;
    const mainOption = DOMOptions.append(main)
    const title = Build.element("h1","title",mainOption);
    title.innerHTML = htmlSafe(module.name)
    renderMember(module,mainOption,true)

    if(!members) return;
    for (const k of kinds)
        if(members[k] && members[k].length) {
            Build.element("h2","member-subtitle",mainOption).innerHTML = wordToTitleCase(k) + (k=="class" ? "es:" :"s:");
            for(const m of members[k]) renderMember(m,mainOption,false);
        }
  
}

/**
 * @param {Doclet} doc
 * @param {DOMOption} opt
 * @param {boolean} isMainPage
 */
 function renderMember(doc, opt,isMainPage) {
    if(!isMainPage || doc.kind == "class") {
        renderName(doc,opt,isMainPage);
        if(doc.kind == "class") return;
    }
    if (doc.summary) Build.element("p","summary",opt).innerHTML = htmlSafe(doc.summary);
    if (doc.description) Build.element("div","description",opt).innerHTML = doc.description;
    if (isFunction(doc)) {
        if(doc.templates) renderTags(doc.templates,opt,"Templates");
        renderTags(doc.params,opt,"Parameters");
    }
    
    renderDetails(doc,opt);
    
    //todo : Fires, examples
    const source = Build.element("span","member-source",opt);
    source.innerHTML = `${doc.meta.filename}: ${doc.meta.lineno},${doc.meta.columnno}`
 }

/* ----------------------------------------------------------------------------------------------------
Helpers
---------------------------------------------------------------------------------------------------- */

/**
 * @param {Doclet} doc
 * @param {DOMOption} opt
 * @param {boolean} isMainPage
 */
function renderName(doc, opt, isMainPage) {
    const name = Build.element("h2","name",opt)
    name.id = doc.___id
    const nameOption = DOMOptions.append(name);
    if(doc.kind == "module" || doc.kind == "namespace" || (!isMainPage && doc.kind == "class")) {
        //linkto
    } else {
        if(doc.attributes) renderAttributes(doc.attributes,nameOption)
        if(isFunction(doc)) {
            renderSignature(doc,nameOption)
        } else {
            Build.textNode(doc.name + ":",nameOption)
            renderType(doc.type,nameOption)
        }
    }


}

/**
 * Checks if doc is callback/function/class
 * @param {Doclet} doc 
 * @return {doc is isFunction}
 */
function isFunction(doc) {
    if(doc.kind == "class" || doc.kind == "function") return true;
    if(doc.kind == "typedef" && doc.type.length == 1 && doc.type[0] == "function") return true;
    return false;
}


/**
 * Render Attributes
 * @param {string[]} attributes 
 * @param {DOMOption} option 
 * @param {"div" | "span"} contType
 */
function renderAttributes(attributes, option,contType = "div") {
    const div = Build.element(contType,"attributes",option);
    
    const contOption = DOMOptions.append(div)
    for (const att of attributes) {
        const img = Build.img(`icons/${att}.svg`,att,"attribute",contOption)
        const detail = Build.element("span","attribute-detail");
        detail.innerHTML = att;
        addMaintainHoverEvent(img,(e)=>{
            positionOnMouse({
                element:detail,
                preventOverflow:true
            },e)
        })
        img.addEventListener("mouseleave",()=>{removeElement(detail)})
    }
    
}

/**
 * Render a function signature
 * @param {DocletBase & isFunction} doc 
 * @param {DOMOption} option
 */
function renderSignature(doc,option) {
    Build.textNode(`${doc.kind == "class" ? "new ":""} ${htmlSafe(doc.name)}(`,option)
    if (doc.params) {
        var lastComma;
        for (const param of doc.params) {
            Build.element("span","signature-param",option).innerHTML = htmlSafe(param.name);
            lastComma = Build.textNode(",",option);
        }
        removeElement(lastComma);
    }
    Build.textNode(")",option)
    if(doc.returns) {
        Build.element("span","return-signature",option).innerHTML = " => " + htmlSafe(doc.returns.type)
    }
}

/**
 * Render a type's names
 * @param {string[]} [type]
 * @param {DOMOption} [option]
 */
 function renderType(type,option) {
    const contOption = DOMOptions.append(Build.element("span","type",option))
    if (type && type.length) {
        for (let i = 0; i < type.length; i++) {
            const name = type[i];
            const span = Build.element("span","type-name",contOption);
            span.innerHTML = htmlSafe(name)
            // linkTo(name,htmlSafe(name),DOMOptions.append(span))
            if (i < type.length-1) Build.textNode("|",contOption)
        }
    }
  }
  



/**
 * 
 * @param {string} longname 
 * @param {string} linkText 
 * @param {DOMOption} option
 * @param {string} [cssClass] 
 */
function linkTo(longname, linkText,option, cssClass) {
  // TODO
}


/**
 * Render parameters of a method
 * @param {TypedTag[] | undefined} params
 * @param {DOMOption} option 
 * @param {"Parameters" | "Properties" | "Templates"} tagType
 */
function renderTags(params, option, tagType) {
    if(!(params) || params.length == 0) return;

    Build.element("h4","table-title",option).innerHTML = tagType
    var hasAttributes = false;
    var hasDefault = false;
    const columns = [{name:"Name",weight:1},{name:"Type",weight:2},{name:"Description",weight:3}]
    for (const param of params) {
        hasAttributes = hasAttributes || (param.optional === true || param.nullable === true || param.variable === true);
        hasDefault = hasDefault || (typeof param.defaultvalue !== 'undefined');
        if(hasAttributes && hasDefault) break
    }
    if(hasAttributes) columns.splice(2,0,{name:"Attributes",weight:1});
    if(hasDefault) columns.splice(columns.length-1,0,{name:"Default",weight:1});
    const table = Build.element("div","doc-table " + tagType,option)
    const tableOption = DOMOptions.append(table);
    
    var columnTemplate = ""
    for(let i = 0; i < columns.length; i++) {
        columnTemplate += columns[i].weight + "fr "
        Build.element("span","doc-table-header",tableOption).innerHTML = columns[i].name;
    }
    table.style.gridTemplateColumns = columnTemplate;

    for (const prop of params) {
        Build.element("span","name",tableOption).innerHTML = prop.name;
        renderType(prop.type,tableOption);
        if (hasAttributes) renderAttributes(["optional","nullable","variable"].filter((a)=>a in prop),tableOption,"span");
        if (hasDefault) Build.element("span","default",tableOption).innerHTML = htmlSafe(prop.defaultvalue??"");
        const ele = Build.element("span","description",tableOption)
        ele.innerHTML = prop.description? prop.description.substring(3,prop.description.length-4) : "";
        if(prop.properties) {
          const opt = DOMOptions.append(ele);
          Build.element("h4","",opt).innerHTML = "Properties:"
          renderTags(prop.properties,opt,"Properties")
        }

    }    
}
/**
 * 
 * @param {Doclet} data 
 * @param {string} tagname 
 * @param {DOMOption} option
 * @param {boolean} multiple
 */
function renderConditionalTag(data,tagname,option, multiple) {
    if (data[tagname] && (!multiple || data[tagname].length)) {
        const suffix = multiple ? "" : "tag-"
        Build.element("dt",suffix + tagname,option).innerHTML = toTitleCase(tagname) + ":"

        const dd = Build.element("dd",suffix + tagname,option)
        const ul = Build.element("ul",multiple ? "" : "dummy",DOMOptions.append(dd))
        if(multiple) {
            for (const i of data["tagname"]) linkTo(i, htmlSafe(i),DOMOptions.append(ul)) 
        }else {
            Build.element("li","",DOMOptions.append(ul)).innerHTML = htmlSafe(data[tagname]);
        }
    }
}

/**
 * A
 * @param {Doclet } data 
 * @param {DOMOption} option 
 */
function renderDetails(data,option) {
    if (data.kind == "typedef" && data.properties && data.properties.length) {
        renderTags(data["properties"],option,"Properties"); 
    } 
    const detailOption = DOMOptions.append(Build.element("dl","details",option));

    for (const tag of ["deprecated","version","since","overrides","copyright","defaultvalue"]) {
        renderConditionalTag(data,tag,detailOption,false)
    }

    if (data["inherited"] && data["inherits"] && !data["overrides"]) { 
        Build.element("dt","inherited-from",detailOption).innerHTML = "Inherited From:"
        const dd =Build.element("dd","inherited-from",detailOption)
        const ul = Build.element("ul","dummy",DOMOptions.append(dd))
        linkTo(data["inherits"], htmlSafe(data["inherits"]),DOMOptions.append(ul));
    }

    for (const tag of ["implementations","implements","mixes","author","tutorials","see","todo"]) {
        renderConditionalTag(data,tag,detailOption,true)
    }
}




/**
 * 
 * @param {Doclet} data 
 */
function goTo(data) {
    SeamlessPage.loadState(data.kind == "class" || data.kind == "module" || data.kind == "namespace" ? data.longname : data.memberof,true,false);
    document.getElementById(data.___id)?.scrollIntoView(true);
}