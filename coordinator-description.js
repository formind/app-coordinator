YUI.add('coordinator-description', function (Y, NAME) {

	var build_count	= "1.0.001";

	
	
	Y.CoordinatorDescription = Y.Base.create('coordinatordescription', Y.DbModelBase, [], {
		idAttribute : "process_name"
		
		
	}, {
			NAME 		: "CoordinatorDescription",
			ATTRS: {
						client_view_type		: {value : "" 	},
						process_result			: {value : "" 	},
						process_error			: {value : "" 	},
						process_name			: {value : "" 	},
						process_step			: {value : 0 	},
						process_editors			: {value : {} 	},
						process_controll		: {value : {} 	},
						params_in				: {value : {} 	},
						params_out				: {value : {} 	}
					}
		});
}, '1.0.1', {"requires": ["dbmodel-base"]});
