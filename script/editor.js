var data;
var currentNode;
var currentNodeMaxIndex;
var currentNodePath;

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
	try {
		data = JSON.parse(string);
	} catch (err) {
		alert("Your JSON is not properly formatted!\n" + err.message);
	}
	$('#save-file-button').css('visibility', 'visible');
	$('#save-string-button').css('visibility', 'visible');
	if (fname !== undefined) {
		$('title').text("JSONEdit: " + fname);
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
	$('#editor-content').empty();
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
				$('#editor-content').append("<div class=\"table-row\">" +
											"<input class=\"key-input\" readonly value=" + i + "> : " +
											"<textarea class=\"table-cell value-input\" readonly value=" + o + " id=\"id-input\">" + o + "</textarea>" +
											"</div>");
			} else {
				$('#editor-content').append("<div class=\"table-row\">" +
											"<input class=\"key-input\" readonly value=" + i + "> : " +
											"<textarea class=\"table-cell value-input\" value=" + o + " id=\"id-input\">" + o + "</textarea>" +
											"</div>");
			}

		});
	} else {
		$.each(targetObj, function (i, o) {
			if (isObject(o)) {
				$('#editor-content').append("<div class=\"table-row\">" +
											"<input class=\"key-input\" value=" + i + "> : " +
											"<textarea class=\"table-cell value-input\" readonly value=" + o + " id=\"id-input\">" + o + "</textarea>" +
											"</div>");
			} else {
				$('#editor-content').append("<div class=\"table-row\">" +
											"<input class=\"key-input\" value=" + i + "> : " +
											"<textarea class=\"table-cell value-input\" value=" + o + " id=\"id-input\">" + o + "</textarea>" +
											"</div>");
			}
		});
	}
	if (!$('.new').length) {
		$('#editor-content').append("<div class=\"table-row\" id='new-row'>" +
									"<button class=\"new\" >Add new value</button> " +
									"</div>");
		$('.new').click(function () {
			var newRow;
			if (Array.isArray(currentNode)) {
				newRow = $("<div class=\"table-row\">" +
						   "<input class=\"key-input\" readonly value=" + (currentNodeMaxIndex++) + "> : " +
						   "<textarea class=\"table-cell value-input\"  id=\"id-input\"> </textarea>" +
						   "</div>");
			} else {
				newRow = $("<div class=\"table-row\">" +
						   "<input class=\"key-input\" > : " +
						   "<textarea class=\"table-cell value-input\"  id=\"id-input\"> </textarea>" +
						   "</div>");
			}
			newRow.insertBefore($('#new-row'));
		});
	}

	if (!$('#save-btn').length) {
		$('#editor-content').append($('<button id="save-btn" class="save-btn">Save</button>'));
		$('#save-btn').click(function () {
			saveDatum();
		})
	}
	$('input[readonly]').keydown(function () {
		alert("Array indices cannot be modified!")
	});
	$('textarea[readonly]').keydown(function () {
		alert("Objects and arrays must be edited in their own node!")
	})

}

function saveDatum() {
	var keys = $('.key-input');
	var values = $('.value-input');
	$.each(keys, function (i, o) {
		currentNode[o.value] = values[i].value;
	});

}

function isObject(obj) {
	return obj === Object(obj);
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

