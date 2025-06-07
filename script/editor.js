export class JSONEdit {
    DELIMITER = String.fromCharCode(7);
    #data;
    #fileName;
    #searchString = "";
    #editingNode;
    #editingNodePath;
    #editingNodeMaxIndex;
    #copyingNode;
    //settings
    #autoTypeConvert = true;
    //UI elements
    #dataBrowser = document.querySelector("#browser");
    #dataTree = document.querySelector("#tree");
    #editor = document.querySelector("#editor-content");
    //buttons
    #saveFileButton = document.querySelector("#save-file-button");
    #loadFileButton = document.querySelector("#load-file-button");
    #saveJsonStringButton = document.querySelector("#save-string-button");
    #loadJsonStringButton = document.querySelector("#load-string-button");
    #newJSONButton = document.querySelector("#new-json-button");
    #copyButton = document.querySelector("#copy-button");
    #pasteButton = document.querySelector("#paste-button");
    #clearButton = document.querySelector("#clear-button");
    #settingButton = document.querySelector("#setting-button");
    //dialogs
    #jsonInputDialog = document.querySelector("#modal-string");
    #jsonOutputDialog = document.querySelector("#modal-string-out");
    #newJsonDialog = document.querySelector("#modal-new-json-root");
    #settingDialog = document.querySelector("#modal-setting");
    //filter input
    #filterInput = document.querySelector("#searchbox");
    saveFile() {
        const odata = JSON.stringify(this.#data);
        const link = document.createElement("a");
        link.download = this.#fileName;
        link.href = window.URL.createObjectURL(new Blob([odata], { type: "application/json" }));
        document.body.appendChild(link);
        window.requestAnimationFrame(() => {
            link.click();
            document.body.removeChild(link);
        });
    }
    loadData(string) {
        //TODO background loading for large json
        try {
            this.#data = JSON.parse(string);
        }
        catch (err) {
            alert("Your JSON contains syntax errors!\n" + "Fail to parse JSON: " + err.message);
            return;
        }
        document.querySelector("#save-json-button").style.visibility = "visible";
        this.#dataBrowser.style.visibility = "visible";
        if (this.#fileName !== undefined) {
            document.title = "JSONEdit: " + this.#fileName;
        }
        else {
            this.#fileName = "JSON.json";
        }
        this.#dataTree.innerHTML = "";
        this.#editor.innerHTML = "";
        this.assembleTreeDisplay();
    }
    loadFile(type) {
        let fileSelector = document.createElement("input");
        fileSelector.type = "file";
        if (type) {
            fileSelector.accept = type;
        }
        fileSelector.addEventListener("change", () => {
            if (!!fileSelector.files) {
                let file = fileSelector.files[0];
                this.#fileName = file.name;
                var reader = new FileReader();
                reader.onload = (e) => {
                    var contents = e.target?.result;
                    this.loadData(contents);
                };
                reader.readAsText(file);
            }
        });
        fileSelector.click();
    }
    assembleTreeDisplay() {
        let tree = this.getTreeNodeHTML(this.#data, this.#fileName);
        if (tree) {
            this.#dataTree.appendChild(tree);
        }
        document.querySelectorAll(".caret").forEach((element) => {
            element.addEventListener("click", (e) => {
                const element = e.target;
                let item = element.parentElement;
                item.querySelector(".tree-node-list")?.classList.toggle("active-tree");
                if (element.innerHTML === "+") {
                    element.innerHTML = "-";
                }
                else if (element.innerHTML === "-") {
                    element.innerHTML = "+";
                }
            });
        });
        document.querySelectorAll(".tree-label").forEach((element) => {
            element.addEventListener("click", (e) => {
                e.stopPropagation();
                document.querySelectorAll(".tree-label-selected").forEach((e2) => e2.classList.toggle("tree-label-selected"));
                e.target.classList.toggle("tree-label-selected");
                this.loadDatum(e.target.dataset.name);
            });
        });
    }
    loadDatum(path) {
        //TODO background loading for large json
        let pathComponents = path.split(this.DELIMITER);
        let index;
        let targetObj;
        this.#editor.innerHTML = "";
        index = 1;
        targetObj = this.#data;
        for (let i = index; i < pathComponents.length; i++) {
            try {
                targetObj = targetObj[pathComponents[i]];
            }
            catch (err) {
                alert(`Unable to load value ${path}:\n` + err.message);
                return;
            }
        }
        if (!this.isObject(targetObj) && !Array.isArray(targetObj)) {
            pathComponents.pop();
            return this.loadDatum(pathComponents.join(this.DELIMITER));
        }
        this.#editingNode = targetObj;
        this.#editingNodePath = path;
        //TODO reduce repeated code
        if (Array.isArray(this.#editingNode)) {
            this.#editingNodeMaxIndex = this.#editingNode.length;
            this.#editingNode.forEach((o, i) => {
                if (this.isObject(o)) {
                    this.#editor.insertAdjacentHTML("beforeend", `
															<div class="table-row">
																<input class="key-input" readonly value=${i}> : <textarea class="table-cell value-input" readonly value=${JSON.stringify(o)} id="id-input">${JSON.stringify(o)}</textarea>
																<button class='delete-row'><i class="material-icons" style="vertical-align: middle;">remove_circle</i>Delete</button>
															</div>`);
                }
                else {
                    this.#editor.insertAdjacentHTML("beforeend", `
															<div class="table-row">
																<input class="key-input" readonly value=${i}> : <textarea class="table-cell value-input" value=${o} id="id-input">${o}</textarea>
																<button class='delete-row'><i class="material-icons" style="vertical-align: middle;">remove_circle</i>Delete</button>
															</div>`);
                }
            });
        }
        else {
            for (let [i, o] of Object.entries(this.#editingNode)) {
                if (this.isObject(o)) {
                    this.#editor.insertAdjacentHTML("beforeend", `
															<div class="table-row">
																<input class="key-input" value=${i}> : <textarea class="table-cell value-input" readonly value=${JSON.stringify(o)} id="id-input">${JSON.stringify(o)}</textarea>
																<button class='delete-row'><i class="material-icons" style="vertical-align: middle;">remove_circle</i>Delete</button>
															</div>`);
                }
                else {
                    this.#editor.insertAdjacentHTML("beforeend", `
															<div class="table-row">
																<input class="key-input" value=${i}> : <textarea class="table-cell value-input" value=${o} id="id-input">${o}</textarea>
																<button class='delete-row'><i class="material-icons" style="vertical-align: middle;">remove_circle</i>Delete</button>
															</div>`);
                }
            }
        }
        if (!document.querySelectorAll(".new").length) {
            //FIXME can this be fixed not generated every time?
            this.#editor.insertAdjacentHTML("beforeend", `
				<div class='table-row' id='new-row'>
					<button class='new'>
						<i class='material-icons' style='vertical-align: middle;'>add_circle</i>
						New...
					</button>
					<ul class='menu' id='new-option'>
						<li class='menu-items' id='new-value-button'><a>Value</a></li>
						<li class='menu-items' id='new-array-button'><a>Array</a></li>
						<li class='menu-items' id='new-object-button'><a>Object</a></li>
					</ul>
				</div>
			`);
            document.querySelector("#new-value-button").addEventListener("click", () => {
                document.querySelector("#new-option").style.display = "none";
                let newRow;
                if (Array.isArray(this.#editingNode)) {
                    newRow = `
						<div class='table-row'><input class='key-input' readonly value=''> :
							<textarea class='table-cell value-input' id='id-input'> </textarea>
							<button class='delete-row'>
								<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete
							</button>
						</div>
					`;
                }
                else {
                    newRow = `
						<div class='table-row'><input class='key-input' value=''> :
							<textarea class='table-cell value-input' id='id-input'> </textarea>
							<button class='delete-row'>
								<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete
							</button>
						</div>
					`;
                }
                document.querySelector("#new-row").insertAdjacentHTML("beforebegin", newRow);
                this.reloadIndices();
            });
            document.querySelector("#new-array-button").addEventListener("click", () => {
                document.querySelector("#new-option").style.display = "none";
                let newRow;
                if (Array.isArray(this.#editingNode)) {
                    newRow = `
						<div class='table-row'><input class='key-input' readonly value=''> :
							<textarea class='table-cell value-input' readonly id='id-input'>[]</textarea>
							<button class='delete-row'>
								<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete
							</button>
						</div>
					`;
                }
                else {
                    newRow = `
						<div class='table-row'><input class='key-input' value=''> :
							<textarea class='table-cell value-input' readonly id='id-input'>[]</textarea>
							<button class='delete-row'>
								<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete
							</button>
						</div>
					`;
                }
                document.querySelector("#new-row").insertAdjacentHTML("beforebegin", newRow);
                this.reloadIndices();
            });
            document.querySelector("#new-object-button").addEventListener("click", () => {
                document.querySelector("#new-option").style.display = "none";
                let newRow;
                if (Array.isArray(this.#editingNode)) {
                    newRow = `
						<div class='table-row'><input class='key-input' readonly value=''> :
							<textarea class='table-cell value-input' readonly id='id-input'>{}</textarea>
							<button class='delete-row'>
								<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete
							</button>
						</div>
					`;
                }
                else {
                    newRow = `
						<div class='table-row'><input class='key-input' value=''> :
							<textarea class='table-cell value-input' readonly id='id-input'>{}</textarea>
							<button class='delete-row'>
								<i class='material-icons' style='vertical-align: middle;'>remove_circle</i>Delete
							</button>
						</div>
					`;
                }
                document.querySelector("#new-row").insertAdjacentHTML("beforebegin", newRow);
                this.reloadIndices();
            });
            document.querySelectorAll(".new").forEach((e) => e.addEventListener("click", () => {
                document.querySelector("#new-option").style.display = "block";
            }));
        }
        if (!!!document.querySelector("#save-btn")) {
            this.#editor.insertAdjacentHTML("beforeend", '<button id="save-btn" class="save-btn raised-button">Save</button>');
            document.querySelector("#save-btn").addEventListener("click", () => {
                this.saveDatum();
            });
        }
        document
            .querySelectorAll(".key-input[readonly]")
            .forEach((e) => e.addEventListener("keydown", () => alert("Array indices cannot be modified!")));
        document
            .querySelectorAll(".value-input[readonly]")
            .forEach((e) => e.addEventListener("keydown", () => alert("Objects and arrays must be edited in their own node!")));
        document.querySelectorAll(".delete-row").forEach((e) => e.addEventListener("click", (e) => {
            e.target.parentNode.remove();
            this.reloadIndices();
        }));
        document.querySelector("#edit-button").style.visibility = "visible";
    }
    saveDatum() {
        const currentNodeOld = JSON.parse(JSON.stringify(this.#editingNode)); //deep cloning (JSON compatible only)
        const oldKeys = Object.keys(currentNodeOld);
        const keys = document.querySelectorAll(".key-input");
        const newKeys = [];
        let values = document.querySelectorAll(".value-input");
        keys.forEach((o, i) => {
            newKeys.push(o.value);
            if (values[i].readOnly) {
                if (oldKeys.includes(o.value)) {
                    //do nothing -- editing prohibited
                }
                else {
                    //okay, that's new
                    if (Array.isArray(this.#editingNode)) {
                        this.#editingNode[Number(o.value)] = JSON.parse(values[i].value);
                    }
                    else {
                        this.#editingNode[o.value] = JSON.parse(values[i].value);
                    }
                }
            }
            else {
                const index = Array.isArray(this.#editingNode) ? Number(o.value) : o.value;
                let newValue = values[i].value;
                if (this.#autoTypeConvert) {
                    if (this.isNumber(newValue)) {
                        newValue = Number(newValue);
                    }
                    else if (newValue === "true" || newValue === "false") {
                        newValue = newValue === "true";
                    }
                }
                this.#editingNode[index] = newValue;
            }
        });
        //remove unwanted properties
        oldKeys.forEach((o) => {
            if (!newKeys.includes(o)) {
                delete this.#editingNode[o];
            }
        });
        //refresh tree
        this.loadData(JSON.stringify(this.#data));
        alert("Content saved.");
    }
    reloadIndices() {
        if (Array.isArray(this.#editingNode)) {
            const keys = document.querySelectorAll(".key-input");
            keys.forEach((o, i) => (o.value = i.toString()));
        }
        else {
            //no need to reload.
        }
    }
    reload() {
        if (!!this.#data) {
            this.loadData(JSON.stringify(this.#data));
        }
    }
    getTreeNodeHTML(object, name) {
        let node = document.createElement("li");
        let list = new Array();
        if (Array.isArray(object)) {
            let length = 0;
            object.forEach((value, key) => {
                let child = this.getTreeNodeHTML(value, name + this.DELIMITER + key);
                if (child !== undefined) {
                    list.push(child);
                    length++;
                }
            });
            if (length > 0) {
                node.insertAdjacentHTML("beforeend", `<span class='caret'>${this.#searchString.length > 0 ? "-" : "+"}</span><span class='tree-label' data-name='${name}'><i class='type-icon-array type-icon'> </i>${name.substr(name.lastIndexOf(this.DELIMITER) + 1)}</span>`);
            }
            else {
                node.insertAdjacentHTML("beforeend", `<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${name}'><i class='type-icon-array type-icon'> </i>${name.substr(name.lastIndexOf(this.DELIMITER) + 1)}</span>`);
            }
        }
        else if (this.isObject(object)) {
            let entries = Object.entries(object);
            let length = 0;
            for (const [key, value] of entries) {
                let child = this.getTreeNodeHTML(value, name + this.DELIMITER + key);
                if (child !== undefined) {
                    list.push(child);
                    length++;
                }
            }
            if (length > 0) {
                node.insertAdjacentHTML("beforeend", `<span class='caret'>${this.#searchString.length > 0 ? "-" : "+"}</span><span class='tree-label' data-name='${name}'><i class='type-icon-object type-icon'> </i>${name.substr(name.lastIndexOf(this.DELIMITER) + 1)}</span>`);
            }
            else {
                node.insertAdjacentHTML("beforeend", `<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${name}'><i class='type-icon-object type-icon'> </i>${name.substr(name.lastIndexOf(this.DELIMITER) + 1)}</span>`);
            }
        }
        else if (this.isNumber(object)) {
            node.insertAdjacentHTML("beforeend", `<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${name}'><i class='type-icon-number type-icon'> </i>${name.substr(name.lastIndexOf(this.DELIMITER) + 1)}</span>`);
        }
        else if (object === true || object === false) {
            node.insertAdjacentHTML("beforeend", `<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${name}'><i class='type-icon-bool type-icon'> </i>${name.substr(name.lastIndexOf(this.DELIMITER) + 1)}</span>`);
        }
        else {
            node.insertAdjacentHTML("beforeend", `<span class='caret'>&nbsp;</span><span class='tree-label' data-name='${name}'><i class='type-icon-string type-icon'> </i>${name.substr(name.lastIndexOf(this.DELIMITER) + 1)}</span>`);
        }
        if (list.length > 0 || this.#searchString.length === 0 || name.toLowerCase().includes(this.#searchString.toLowerCase())) {
            let nodeList = document.createElement("ul");
            nodeList.classList.add("tree-node-list");
            if (this.#searchString.length > 0 &&
                name.split(this.DELIMITER).pop().toLowerCase().includes(this.#searchString.toLowerCase())) {
                nodeList.classList.add("active-tree");
            }
            for (let i = 0; i < list.length; i++) {
                nodeList.appendChild(list[i]);
            }
            node.appendChild(nodeList);
            return node;
        }
        else {
            return undefined;
        }
    }
    copyDatum() {
        this.#copyingNode = JSON.stringify(this.#editingNode);
        alert("Current element copied.");
    }
    pasteDatum() {
        if (!!this.#copyingNode) {
            let newRow;
            if (Array.isArray(this.#editingNode)) {
                newRow = `
			<div class='table-row'>
				<input class='key-input' readonly value=''> : 
				<textarea class='table-cell value-input' readonly id='id-input'>
					${this.#copyingNode}
				</textarea>
				<button class='delete-row'><i class='material-icons'style='vertical-align: middle;'>remove_circle</i>Delete</button>
			</div>`;
            }
            else {
                newRow = `
			<div class='table-row'>
				<input class='key-input'> : 
				<textarea class='table-cell value-input' readonly id='id-input'>
					${this.#copyingNode}
				</textarea>
				<button class='delete-row'><i class='material-icons'style='vertical-align: middle;'>remove_circle</i>Delete</button>
			</div>`;
            }
            document.querySelector("#new-row").insertAdjacentHTML("beforebegin", newRow);
            this.reloadIndices();
        }
    }
    isObject(obj) {
        return obj === Object(obj);
    }
    isNumber(n) {
        return typeof n === "number";
    }
    constructor() {
        this.#saveFileButton.addEventListener("click", () => {
            this.saveFile();
        });
        this.#loadFileButton.addEventListener("click", () => {
            this.loadFile(".json");
        });
        this.#filterInput.addEventListener("keyup", (e) => {
            this.#searchString = e.target.value;
            this.reload();
        });
        this.#newJSONButton.addEventListener("click", () => {
            if (this.#data !== undefined) {
                if (!confirm("Creating a new JSON will discard the JSON you are currently editing.\nAre you sure you want to continue?")) {
                    return;
                }
            }
            this.#newJsonDialog.showModal();
        });
        this.setPopupCloseTrigger(this.#newJsonDialog);
        document.querySelector("#new-json").addEventListener("click", () => {
            if (document.querySelector("#option-ary").checked === true) {
                this.loadData("[]");
                this.#newJsonDialog.close();
            }
            else if (document.querySelector("#option-obj").checked === true) {
                this.loadData("{}");
                this.#newJsonDialog.close();
            }
        });
        this.#settingButton.addEventListener("click", () => {
            this.#settingDialog.showModal();
        });
        this.setPopupCloseTrigger(this.#settingDialog);
        document.querySelector("#save-setting").addEventListener("click", () => {
            this.#autoTypeConvert = document.querySelector("#option-type-convert").checked;
            this.#settingDialog.close();
        });
        this.#saveJsonStringButton.addEventListener("click", () => {
            this.#jsonOutputDialog.showModal();
            const output = document.querySelector("#string-output");
            output.value = JSON.stringify(this.#data);
            output.focus();
            output.select();
        });
        this.setPopupCloseTrigger(this.#jsonOutputDialog);
        document.querySelector("#copy-string").addEventListener("click", () => {
            navigator.clipboard.writeText(JSON.stringify(this.#data));
            alert("Output JSON copied to your clipboard.");
        });
        this.#loadJsonStringButton.addEventListener("click", () => {
            this.#jsonInputDialog.showModal();
        });
        document.querySelector("#load-string").addEventListener("click", () => {
            this.loadData(document.querySelector("#string-input").value);
            this.#jsonInputDialog.close();
        });
        this.setPopupCloseTrigger(this.#jsonInputDialog);
        this.#copyButton.addEventListener("click", () => {
            this.copyDatum();
        });
        this.#pasteButton.addEventListener("click", () => {
            this.pasteDatum();
        });
    }
    setPopupCloseTrigger(popup) {
        //TODO replace this with https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#closedby
        popup.addEventListener("click", (event) => {
            const boundingBox = popup.getBoundingClientRect();
            if (!(boundingBox.top <= event.clientY &&
                event.clientY <= boundingBox.top + boundingBox.height &&
                boundingBox.left <= event.clientX &&
                event.clientX <= boundingBox.left + boundingBox.width)) {
                popup.close();
            }
        });
    }
}
