YUI.add('editor-params', function (Y, NAME) {

	var build_count	= "1.0.001";

	Y.EditorParams = Y.Base.create('editorparams', Y.Model, [], {
		
		}, {
			NAME 		: {value : "EditorParams" },
			ATTRS: {
						ed_params				: {value : {} 	},
		}
	});
}, '1.0.1', {"requires": ["model"]});
