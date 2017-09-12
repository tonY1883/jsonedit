var data;
var currentNode;
var currentNodeMaxIndex;
var currentNodePath;

var autoTypeConvert = true;

var fname;

function loadFile(type) {
	var fileSelector = $('<input type="file">');
	if (type) {
		fileSelector.attr('accept', type);
	}
	fileSelector.change(function () {
		var file = fileSelector[0].files[0];
		fname = file.name;
		var reader = new FileReader();
		reader.onload = function (e) {
			var contents = e.target.result;
			loadData(contents);
		};
		reader.readAsText(file);
	});
	fileSelector.click();
}

function loadData(string) {
	//TODO refresh not reload
	try {
		data = JSON.parse(string);
	} catch (err) {
		alert("Your JSON contains syntax errors!\n" + "Fail to parse JSON: " + err.message);
		return;
	}
	$('#save-json-button').css('visibility', 'visible');
	$('#browser').css('visibility', 'visible');
	if (fname !== undefined) {
		$('title').text("JSONEdit: " + fname);
	} else {
		fname = "JSON.json";
	}
	//assemble tree view
	var treeObj = {};
	var treePlugins = [
		"search"
	];
	var treeSearchModule = {
		"case_insensitive": true,
		"show_only_matches": true
	};
	treeObj["core"] = {};
	treeObj.core["data"] = assembleTreeJson(data);
	treeObj["plugins"] = treePlugins;
	treeObj["search"] = treeSearchModule;
	$('#tree').jstree("destroy").jstree(treeObj);
	$('#editor-content').empty();
}

function assembleTreeJson(object, name) {
	var result = {};
	if (name === undefined) {
		name = object.constructor.name
	}
	result['text'] = name;
	result["icon"] = false;
	//TODO find proper icons
	if (Array.isArray(object)) {
		var ary = [];
		var children = false;
		$.each(object, function (i, o) {
			var uname = i.toString();
			if (isObject(o) || Array.isArray(o)) {
				children = true;
				ary[i] = assembleTreeJson(o, uname);
			}
		});
		if (children) {
			result['children'] = ary;
		}
		return result;
	} else if (isObject(object)) {
		var ary = [];
		var c = 0;
		$.each(object, function (i, o) {
			if (isObject(o) || Array.isArray(o)) {
				ary[c] = assembleTreeJson(o, i);
				c++;
			}
		});
		result['children'] = ary;
		return result;
	} else {
		return null;
	}
}

function loadDatum(path) {
	var pathComponents = path.split(">");
	var index;
	var targetObj;
	var editor = $('#editor-content');
	editor.empty().unbind();
	index = 1;
	targetObj = data;
	for (var i = index; i < pathComponents.length; i++) {
		targetObj = targetObj[pathComponents[i]];
	}
	currentNode = targetObj;
	currentNodePath = path;
	//TODO reduce repeated code
	if (Array.isArray(currentNode)) {
		currentNodeMaxIndex = currentNode.length;
		$.each(currentNode, function (i, o) {
			if (isObject(o)) {
				editor.append("<div class=\"table-row\">" +
							  "<input class=\"key-input\" readonly value=" + i + "> : " +
							  "<textarea class=\"table-cell value-input\" readonly value=" + JSON.stringify(o) + " id=\"id-input\">" + JSON.stringify(o) + "</textarea>" +
							  "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
							  "</div>");
			} else {
				editor.append("<div class=\"table-row\">" +
							  "<input class=\"key-input\" readonly value=" + i + "> : " +
							  "<textarea class=\"table-cell value-input\" value=" + o + " id=\"id-input\">" + o + "</textarea>" +
							  "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
							  "</div>");
			}

		});
	} else {
		$.each(targetObj, function (i, o) {
			if (isObject(o)) {
				editor.append("<div class=\"table-row\">" +
							  "<input class=\"key-input\" value=" + i + "> : " +
							  "<textarea class=\"table-cell value-input\" readonly value=" + JSON.stringify(o) + " id=\"id-input\">" + JSON.stringify(o) + "</textarea>" +
							  "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
							  "</div>");
			} else {
				editor.append("<div class=\"table-row\">" +
							  "<input class=\"key-input\" value=" + i + "> : " +
							  "<textarea class=\"table-cell value-input\" value=" + o + " id=\"id-input\">" + o + "</textarea>" +
							  "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
							  "</div>");
			}
		});
	}
	if (!$('.new').length) {
		//FIXME can this be fixed not generated every time?
		editor.append("<div class=\"table-row\" id='new-row'>" +
									"<button class=\"new\" ><i class=\"material-icons\" style=\"vertical-align: middle;\">add_circle</i>New...</button> " + "<ul class='menu' id='new-option'>" +
									"<li class=\"menu-items\" id=\"new-value-button\"><a >Value</a></li>" +
									"<li class=\"menu-items\"id=\"new-array-button\"><a >Array</a></li>" +
									"<li class=\"menu-items\"id=\"new-object-button\"><a >Object</a></li>" +
									"</ul>" +
									"</div>");
		$('.new').click(function () {
			$('#new-option').show();
		});
		$('#new-value-button').click(function () {
			$('#new-option').hide();
			var newRow;
			if (Array.isArray(currentNode)) {
				newRow = $("<div class=\"table-row\">" +
						   "<input class=\"key-input\" readonly value=\"\"> : " +
						   "<textarea class=\"table-cell value-input\"  id=\"id-input\"> </textarea>" +
						   "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
						   "</div>");
			} else {
				newRow = $("<div class=\"table-row\">" +
						   "<input class=\"key-input\" > : " +
						   "<textarea class=\"table-cell value-input\"  id=\"id-input\"> </textarea>" +
						   "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
						   "</div>");
			}
			newRow.insertBefore($('#new-row'));
			reloadIndices();
		});
		$('#new-array-button').click(function () {
			$('#new-option').hide();
			var newRow;
			if (Array.isArray(currentNode)) {
				newRow = $("<div class=\"table-row\">" +
						   "<input class=\"key-input\" readonly value=\"\"> : " +
						   "<textarea class=\"table-cell value-input\"  readonly id=\"id-input\">[]</textarea>" +
						   "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
						   "</div>");
			} else {
				newRow = $("<div class=\"table-row\">" +
						   "<input class=\"key-input\" > : " +
						   "<textarea class=\"table-cell value-input\" readonly id=\"id-input\">[]</textarea>" +
						   "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
						   "</div>");
			}
			newRow.insertBefore($('#new-row'));
			reloadIndices();
		});

		$('#new-object-button').click(function () {
			$('#new-option').hide();
			var newRow;
			if (Array.isArray(currentNode)) {
				newRow = $("<div class=\"table-row\">" +
						   "<input class=\"key-input\" readonly value=\"\"> : " +
						   "<textarea class=\"table-cell value-input\"  readonly id=\"id-input\">{}</textarea>" +
						   "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
						   "</div>");
			} else {
				newRow = $("<div class=\"table-row\">" +
						   "<input class=\"key-input\" > : " +
						   "<textarea class=\"table-cell value-input\" readonly id=\"id-input\">{}</textarea>" +
						   "<button class='delete-row'><i class=\"material-icons\" style=\"vertical-align: middle;\">remove_circle</i>Delete</button>" +
						   "</div>");
			}
			newRow.insertBefore($('#new-row'));
			reloadIndices();
		});
	}

	if (!$('#save-btn').length) {
		$('#editor-content').append($('<button id="save-btn" class="save-btn">Save</button>'));
		$('#save-btn').click(function () {
			saveDatum();
		})
	}
	editor.on("keydown", '.key-input[readonly]', function () {
		alert("Array indices cannot be modified!")
	});
	editor.on("keydown", '.value-input[readonly]', function () {
		alert("Objects and arrays must be edited in their own node!")
	});
	editor.on("click", '.delete-row', function () {
		$(this).parent().remove();
		if (Array.isArray(currentNode)) {
			reloadIndices();
		}
	});
	$('#edit-button').css('visibility', 'visible');
}

function reloadIndices() {
	if (Array.isArray(currentNode)) {
		var keys = $('.key-input');
		$.each(keys, function (i, o) {
			o.value = i;
		});
	} else {
		//no need to reload.
	}
}

function saveDatum() {
	var currentNodeOld = JSON.parse(JSON.stringify(currentNode));//deep cloning (JSON compatible only)
	var oldKeys = Object.keys(currentNodeOld);
	var keys = $('.key-input');
	var newKeys = [];
	var values = $('.value-input');
	$.each(keys, function (i, o) {
		newKeys.push(o.value);
		if ($(values[i]).prop('readonly')) {
			if ($.inArray(o.value, oldKeys) > -1) {
				//do nothing -- editing prohibited
			} else {
				//okay, that's new
				currentNode[o.value] = JSON.parse(values[i].value);
			}
		} else {
			if (autoTypeConvert) {
				if (isNumber(values[i].value)) {
					currentNode[o.value] = Number(values[i].value);
				} else if (values[i].value === "true") {
					currentNode[o.value] = true;
				} else if (values[i].value === "false") {
					currentNode[o.value] = false;
				} else {
					currentNode[o.value] = values[i].value;
				}
			} else {
				currentNode[o.value] = values[i].value;
			}
		}

	});
	//remove unwanted properties
	$.each(oldKeys, function (i, o) {
		if ($.inArray(o, newKeys) < 0) {
			delete currentNode[o]
		}
	});
	//refresh tree
	loadData(JSON.stringify(data));
	alert("Content saved.")

}

function isObject(obj) {
	return obj === Object(obj);
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function saveFile() {
	var odata = JSON.stringify(data);
	var link = document.createElement('a');
	link.setAttribute('download', fname);
	link.href = window.URL.createObjectURL(new Blob([odata], {type: "application/json"}));
	document.body.appendChild(link);
	window.requestAnimationFrame(function () {
		link.click();
		document.body.removeChild(link);
	});
}

$('#save-file-button').click(function () {
	saveFile();
});

$('#load-file-button').click(function () {
	loadFile('.json');

});

$('#new-json-button').click(function () {
	if (data !== undefined) {
		if (!confirm("Creating a new JSON will discard the JSON you are currently editing.\nAre you sure you want to continue?")) {
			return;
		}
	}
	$('#modal-new-json-bg').show();
	window.onclick = function (event) {
		if (event.target == $('#modal-new-json-bg')[0]) {
			$('#modal-new-json-bg').hide();
		}
	};
	$('#new-json').click(function () {
		if ($('#option-ary')[0].checked === true) {
			loadData("[]");
			$('#modal-new-json-bg').hide();
		} else if ($('#option-obj')[0].checked === true) {
			loadData("{}");
			$('#modal-new-json-bg').hide();
		}
	});
});

$('#setting-button').click(function () {
	$('#modal-setting-bg').show();
	window.onclick = function (event) {
		if (event.target == $('#modal-setting-bg')[0]) {
			$('#modal-setting-bg').hide();
		}
	};
	$('#save-setting').click(function () {
		autoTypeConvert = $('#option-type-convert')[0].checked;
	});


});

$('#save-string-button').click(function () {
	$('#modal-string-out-bg').show().click(function (e) {
		$(this).hide();
	}).children().click(function (e) {
		return false;
	});
	$('#string-output').val(JSON.stringify(data)).focus().select();
	$('#copy-string').click(function () {
		$('#string-output').focus().select();
		document.execCommand("copy");
		alert("Output JSON copied to your clipboard.");
	});
});

$('#load-string-button').click(function () {
	$('#modal-string-bg').show().click(function (e) {
		$(this).hide();
	}).children().click(function (e) {
		return false;
	});
	$('#load-string').click(function () {
		loadData($('#string-input').val());
		$('#modal-string-bg').hide();
	});
});

$("#searchbox").keyup(function () {
	var searchString = $(this).val();
	$('#tree').jstree('search', searchString);
});

$(document).on('click', '.jstree-anchor', function (e) {
	var anchorId = $(this).parent().attr('id');
	var clickId = anchorId.substring(anchorId.indexOf('_') + 1, anchorId.length);
	//$('#tree').jstree().get_path($('#tree').jstree("get_selected", true)[0], ' > ');
	loadDatum($('#tree').jstree().get_path($('#tree').jstree("get_selected", true)[0], '>'));
});

