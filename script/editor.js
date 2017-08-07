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
$('#tree').jstree({
    'core': {

        'data': [{
            "id": "1",
            "text": "Item 1",
            "icon": "",
            "state": {
                "opened": false,
                "disabled": false,
                "selected": false
            },
            "children": [
                {
                    "id": "1.1",
                    "text": "Sub Item 1",
                    "icon": "",
                    "state": {
                        "opened": false,
                        "disabled": false,
                        "selected": false
                    },
                    "children": false,
                    "liAttributes": null,
                    "aAttributes": null
                }, {
                    "id": "1.2",
                    "text": "Sub Item 2",
                    "icon": "",
                    "state": {
                        "opened": false,
                        "disabled": false,
                        "selected": false
                    },
                    "children": false,
                    "liAttributes": null,
                    "aAttributes": null
                }
            ],
            "liAttributes": null,
            "aAttributes": null
        }, {
            "id": "2",
            "text": "Item 2",
            "icon": "",
            "state": {
                "opened": false,
                "disabled": false,
                "selected": false
            },
            "children": [],
            "liAttributes": null,
            "aAttributes": null
        }]


    },
    "search": {

        "case_insensitive": true,
        "show_only_matches": true


    },
    "plugins": ["search"]
});