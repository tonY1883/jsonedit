var data;
var currentNode;

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

function loadData(fileText) {
	data = JSON.parse(fileText);
	console.log(Array.isArray(data));
	$('#save-file-button').css('visibility', 'visible');
	$('title').text("JSONEdit: " + fname);
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
}

function assembleTreeJson(object, name) {
	var result = {};
	if (name === undefined) {
		name = object.constructor.name
	}
	result['text'] = name;
	if (Array.isArray(object)) {
		var ary = [object.length];
		$.each(object, function (i, o) {
			var uname = i.toString();
			if (isObject(o) || Array.isArray(o)) {
				ary[i] = assembleTreeJson(o, uname);
			}

		});
		result['children'] = ary;
		var rAry = [];
		rAry[0] = result;
		return rAry;
	} else if (isObject(object)) {
		$.each(object, function (i, o) {
			if (isObject(o) || Array.isArray(o)) {
				result['children'] = assembleTreeJson(o, i);
			}
		});
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
	//TODO reduce repeated code
	if (Array.isArray(targetObj)) {
		$.each(targetObj, function (i, o) {
			if (isObject(o)) {
				$('#editor-content').append("<div class=\"table-row\">" +
											"<input class=\"key-input\" disabled value=" + i + "> : " +
											"<textarea class=\"table-cell value-input\" disabled value=" + o + " id=\"id-input\">" + o + "</textarea>" +
											"</div>");
			} else {
				$('#editor-content').append("<div class=\"table-row\">" +
											"<input class=\"key-input\" disabled value=" + i + "> : " +
											"<textarea class=\"table-cell value-input\" value=" + o + " id=\"id-input\">" + o + "</textarea>" +
											"</div>");
			}

		});
	} else {
		$.each(targetObj, function (i, o) {
			if (isObject(o)) {
				$('#editor-content').append("<div class=\"table-row\">" +
											"<input class=\"key-input\" value=" + i + "> : " +
											"<textarea class=\"table-cell value-input\" disabled value=" + o + " id=\"id-input\">" + o + "</textarea>" +
											"</div>");
			} else {
				$('#editor-content').append("<div class=\"table-row\">" +
											"<input class=\"key-input\" value=" + i + "> : " +
											"<textarea class=\"table-cell value-input\" value=" + o + " id=\"id-input\">" + o + "</textarea>" +
											"</div>");
			}
		});
	}

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
