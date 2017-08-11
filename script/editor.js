var data;
var scenes;

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
	$('#editor').html(JSON.stringify(data));
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
	$('#editor').html(JSON.stringify(treeObj));
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

//TODO load real stuff
