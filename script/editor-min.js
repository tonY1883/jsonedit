//For uncompressed source code, visit https://github.com/tonY1883/jsonedit
var data,currentNode,currentNodeMaxIndex,currentNodePath,fname,copiedNode,autoTypeConvert=!0,searchString="";const DELIMITER=String.fromCharCode(7);function loadFile(t){let e=document.createElement("input");e.type="file",t&&e.setAttribute("accept",t),e.addEventListener("change",()=>{let t=e.files[0];fname=t.name;var n=new FileReader;n.onload=function(t){loadData(t.target.result)},n.readAsText(t)}),e.click()}function loadData(t){try{data=JSON.parse(t)}catch(t){return void alert("Your JSON contains syntax errors!\nFail to parse JSON: "+t.message)}document.querySelector("#save-json-button").style.visibility="visible",document.querySelector("#browser").style.visibility="visible",void 0!==fname?document.querySelector("title").innerText="JSONEdit: "+fname:fname="JSON.json",document.querySelector("#tree").innerHTML="",document.querySelector("#editor-content").innerHTML="",assembleTreeDisplay(data,fname)}function assembleTreeDisplay(t,e){document.querySelector("#tree").appendChild(getTreeNodeHTML(t,e)),document.querySelectorAll(".caret").forEach(t=>{t.addEventListener("click",t=>{let e=t.target.parentElement;e.querySelector(".tree-node-list")?.classList.toggle("active-tree"),"+"===e.querySelector(".caret").innerHTML?e.querySelector(".caret").innerHTML="-":"-"===e.querySelector(".caret").innerHTML&&(e.querySelector(".caret").innerHTML="+")})}),document.querySelectorAll(".tree-label").forEach(t=>{t.addEventListener("click",t=>{t.stopPropagation(),document.querySelectorAll(".tree-label-selected").forEach(t=>t.classList.toggle("tree-label-selected")),t.target.classList.toggle("tree-label-selected"),loadDatum(t.target.dataset.name)})})}function refreshTree(){data&&loadData(JSON.stringify(data))}function getTreeNodeHTML(t,e){let n=document.createElement("li"),a=[];if(Array.isArray(t)){let l=0;t.forEach((t,n)=>{let r=getTreeNodeHTML(t,e+DELIMITER+n);void 0!==r&&(a.push(r),l++)}),l>0?n.insertAdjacentHTML("beforeend",`<span class='caret'>+</span><span class='tree-label' data-name='${e}'><i class='type-icon-array type-icon'> </i>${e.substr(e.lastIndexOf(DELIMITER)+1)}</span>`):n.insertAdjacentHTML("beforeend",`<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${e}'><i class='type-icon-array type-icon'> </i>${e.substr(e.lastIndexOf(DELIMITER)+1)}</span>`)}else if(isObject(t)){let l=Object.entries(t),r=0;for(const[t,n]of l){let l=getTreeNodeHTML(n,e+DELIMITER+t);void 0!==l&&(a.push(l),r++)}r>0?n.insertAdjacentHTML("beforeend",`<span class='caret'>+</span><span class='tree-label' data-name='${e}'><i class='type-icon-object type-icon'> </i>${e.substr(e.lastIndexOf(DELIMITER)+1)}</span>`):n.insertAdjacentHTML("beforeend",`<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${e}'><i class='type-icon-object type-icon'> </i>${e.substr(e.lastIndexOf(DELIMITER)+1)}</span>`)}else isNumber(t)?n.insertAdjacentHTML("beforeend",`<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${e}'><i class='type-icon-number type-icon'> </i>${e.substr(e.lastIndexOf(DELIMITER)+1)}</span>`):"true"===t||"false"===t?n.insertAdjacentHTML("beforeend",`<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${e}'><i class='type-icon-bool type-icon'> </i>${e.substr(e.lastIndexOf(DELIMITER)+1)}</span>`):n.insertAdjacentHTML("beforeend",`<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${e}'><i class='type-icon-string type-icon'> </i>${e.substr(e.lastIndexOf(DELIMITER)+1)}</span>`);if(e.includes(searchString)||a.length>0){let t=document.createElement("ul");t.classList.add("tree-node-list");for(let e=0;e<a.length;e++)t.appendChild(a[e]);return n.appendChild(t),n}}function loadDatum(t){let e,n,a=t.split(DELIMITER),l=document.querySelector("#editor-content");l.innerHTML="",e=1,n=data;for(let t=1;t<a.length;t++)n=n[a[t]];if(!isObject(n)&&!Array.isArray(n))return a.pop(),loadDatum(a.join(DELIMITER));if(currentNode=n,currentNodePath=t,Array.isArray(currentNode))currentNodeMaxIndex=currentNode.length,currentNode.forEach((t,e)=>{isObject(t)?l.insertAdjacentHTML("beforeend",`\n<div class="table-row">\n<input class="key-input" readonly value=${e}> : <textarea class="table-cell value-input" readonly value=${JSON.stringify(t)} id="id-input">${JSON.stringify(t)}</textarea>\n<button class='delete-row'><i class="material-icons" style="vertical-align: middle;">remove_circle</i>Delete</button>\n</div>`):l.insertAdjacentHTML("beforeend",`\n<div class="table-row">\n<input class="key-input" readonly value=${e}> : <textarea class="table-cell value-input" value=${t} id="id-input">${t}</textarea>\n<button class='delete-row'><i class="material-icons" style="vertical-align: middle;">remove_circle</i>Delete</button>\n</div>`)});else for(let[t,e]of Object.entries(currentNode))isObject(e)?l.insertAdjacentHTML("beforeend",`\n<div class="table-row">\n<input class="key-input" readonly value=${t}> : <textarea class="table-cell value-input" readonly value=${JSON.stringify(e)} id="id-input">${JSON.stringify(e)}</textarea>\n<button class='delete-row'><i class="material-icons" style="vertical-align: middle;">remove_circle</i>Delete</button>\n</div>`):l.insertAdjacentHTML("beforeend",`\n<div class="table-row">\n<input class="key-input" readonly value=${t}> : <textarea class="table-cell value-input" value=${e} id="id-input">${e}</textarea>\n<button class='delete-row'><i class="material-icons" style="vertical-align: middle;">remove_circle</i>Delete</button>\n</div>`);document.querySelectorAll(".new").length||(l.insertAdjacentHTML("beforeend","\n<div class='table-row' id='new-row'>\n<button class='new'>\n<i class='material-icons' style='vertical-align: middle;'>add_circle</i>\nNew...\n</button>\n<ul class='menu' id='new-option'>\n<li class='menu-items' id='new-value-button'><a>Value</a></li>\n<li class='menu-items' id='new-array-button'><a>Array</a></li>\n<li class='menu-items' id='new-object-button'><a>Object</a></li>\n</ul>\n</div>\n"),document.querySelector("#new-value-button").addEventListener("click",()=>{let t;document.querySelector("#new-option").style.display="none",t=Array.isArray(currentNode)?"\n<div class='table-row'><input class='key-input' readonly value=''> :\n<textarea class='table-cell value-input' id='id-input'> </textarea>\n<button class='delete-row'>\n<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete\n</button>\n</div>\n":"\n<div class='table-row'><input class='key-input' value=''> :\n<textarea class='table-cell value-input' id='id-input'> </textarea>\n<button class='delete-row'>\n<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete\n</button>\n</div>\n",document.querySelector("#new-row").insertAdjacentHTML("beforebegin",t),reloadIndices()}),document.querySelector("#new-array-button").addEventListener("click",()=>{let t;document.querySelector("#new-option").style.display="none",t=Array.isArray(currentNode)?"\n<div class='table-row'><input class='key-input' readonly value=''> :\n<textarea class='table-cell value-input' readonly id='id-input'>[]</textarea>\n<button class='delete-row'>\n<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete\n</button>\n</div>\n":"\n<div class='table-row'><input class='key-input' value=''> :\n<textarea class='table-cell value-input' readonly id='id-input'>[]</textarea>\n<button class='delete-row'>\n<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete\n</button>\n</div>\n",document.querySelector("#new-row").insertAdjacentHTML("beforebegin",t),reloadIndices()}),document.querySelector("#new-object-button").addEventListener("click",()=>{let t;document.querySelector("#new-option").style.display="none",t=Array.isArray(currentNode)?"\n<div class='table-row'><input class='key-input' readonly value=''> :\n<textarea class='table-cell value-input' readonly id='id-input'>{}</textarea>\n<button class='delete-row'>\n<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete\n</button>\n</div>\n":"\n<div class='table-row'><input class='key-input' value=''> :\n<textarea class='table-cell value-input' readonly id='id-input'>{}</textarea>\n<button class='delete-row'>\n<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete\n</button>\n</div>\n",document.querySelector("#new-row").insertAdjacentHTML("beforebegin",t),reloadIndices()}),document.querySelectorAll(".new").forEach(t=>t.addEventListener("click",()=>{document.querySelector("#new-option").style.display="block"}))),document.querySelector("#save-btn")||(document.querySelector("#editor-content").insertAdjacentHTML("beforeend",'<button id="save-btn" class="save-btn raised-button">Save</button>'),document.querySelector("#save-btn").addEventListener("click",()=>{saveDatum()})),document.querySelectorAll(".key-input[readonly]").forEach(t=>t.addEventListener("keydown",()=>alert("Array indices cannot be modified!"))),document.querySelectorAll(".value-input[readonly]").forEach(t=>t.addEventListener("keydown",()=>alert("Objects and arrays must be edited in their own node!"))),document.querySelectorAll(".delete-row").forEach(t=>t.addEventListener("click",t=>{t.target.parentNode.remove(),Array.isArray(currentNode)&&reloadIndices()})),document.querySelector("#edit-button").style.visibility="visible"}function reloadIndices(){Array.isArray(currentNode)&&document.querySelectorAll(".key-input").forEach((t,e)=>t.value=e)}function copyDatum(){copiedNode=JSON.stringify(currentNode),alert("Current element copied.")}function pasteDatum(){if(copiedNode){let t;t=Array.isArray(currentNode)?`\n<div class='table-row'>\n<input class='key-input' readonly value=''> : \n<textarea class='table-cell value-input' readonly id='id-input'>\n${copiedNode}\n</textarea>\n<button class='delete-row'><i class='material-icons'style='vertical-align: middle;'>remove_circle</i>Delete</button>\n</div>`:`\n<div class='table-row'>\n<input class='key-input'> : \n<textarea class='table-cell value-input' readonly id='id-input'>\n${copiedNode}\n</textarea>\n<button class='delete-row'><i class='material-icons'style='vertical-align: middle;'>remove_circle</i>Delete</button>\n</div>`,document.querySelector("#new-row").insertAdjacentHTML("beforebegin",t),reloadIndices()}}function saveDatum(){let t=JSON.parse(JSON.stringify(currentNode)),e=Object.keys(t),n=document.querySelectorAll(".key-input"),a=[],l=document.querySelectorAll(".value-input");n.forEach((t,n)=>{a.push(t.value),l[n].readOnly?e.includes(t.value)||(currentNode[t.value]=JSON.parse(l[n].value)):autoTypeConvert?isNumber(l[n].value)?currentNode[t.value]=Number(l[n].value):"true"===l[n].value?currentNode[t.value]=!0:"false"===l[n].value?currentNode[t.value]=!1:currentNode[t.value]=l[n].value:currentNode[t.value]=l[n].value}),e.forEach(t=>{a.includes(t)||delete currentNode[t]}),loadData(JSON.stringify(data)),alert("Content saved.")}function isObject(t){return t===Object(t)}function isNumber(t){return!isNaN(parseFloat(t))&&isFinite(t)}function saveFile(){var t=JSON.stringify(data),e=document.createElement("a");e.setAttribute("download",fname),e.href=window.URL.createObjectURL(new Blob([t],{type:"application/json"})),document.body.appendChild(e),window.requestAnimationFrame(()=>{e.click(),document.body.removeChild(e)})}document.querySelector("#save-file-button").addEventListener("click",()=>{saveFile()}),document.querySelector("#load-file-button").addEventListener("click",()=>{loadFile(".json")}),document.querySelector("#new-json-button").addEventListener("click",()=>{(void 0===data||confirm("Creating a new JSON will discard the JSON you are currently editing.\nAre you sure you want to continue?"))&&(document.querySelector("#modal-new-json-bg").style.display="block",window.onclick=function(t){t.target==document.querySelector("#modal-new-json-bg")&&(document.querySelector("#modal-new-json-bg").style.display="none")},document.querySelector("#new-json").addEventListener("click",()=>{!0===document.querySelector("#option-ary").checked?(loadData("[]"),document.querySelector("#modal-new-json-bg").style.display="none"):!0===document.querySelector("#option-obj").checked&&(loadData("{}"),document.querySelector("#modal-new-json-bg").style.display="none")}))}),document.querySelector("#setting-button").addEventListener("click",()=>{document.querySelector("#modal-setting-bg").style.display="block",window.onclick=function(t){t.target===document.querySelector("#modal-setting-bg")&&(document.querySelector("#modal-setting-bg").style.display="none")},document.querySelector("#save-setting").addEventListener("click",()=>{autoTypeConvert=document.querySelector("#option-type-convert").checked,document.querySelector("#modal-setting-bg").style.display="none"})}),document.querySelector("#save-string-button").addEventListener("click",()=>{let t=document.querySelector("#modal-string-out-bg");t.style.display="block",t.addEventListener("click",(function(t){t.target.style.display="none"})),t.childNodes.forEach(t=>t.addEventListener("click",t=>{t.stopPropagation()}));let e=document.querySelector("#string-output");e.value=JSON.stringify(data),e.focus(),e.select(),document.querySelector("#copy-string").addEventListener("click",()=>{let t=document.querySelector("#string-output");t.focus(),t.select(),document.execCommand("copy"),alert("Output JSON copied to your clipboard.")})}),document.querySelector("#load-string-button").addEventListener("click",()=>{let t=document.querySelector("#modal-string-bg");t.style.display="block",t.addEventListener("click",(function(t){t.target.style.display="none"})),t.childNodes.forEach(t=>t.addEventListener("click",t=>{t.stopPropagation()})),document.querySelector("#load-string").addEventListener("click",()=>{loadData(document.querySelector("#string-input").value),document.querySelector("#modal-string-bg").style.display="none"})}),document.querySelector("#copy-button").addEventListener("click",()=>{copyDatum()}),document.querySelector("#paste-button").addEventListener("click",()=>{pasteDatum()}),document.querySelector("#searchbox").addEventListener("keyup",t=>{searchString=t.target.value,refreshTree()});
