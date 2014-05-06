YUI.add('dbmodel-base', function (Y, NAME) {

	var build_count	= "1.0.001";

	
	
	Y.DbModelBase = Y.Base.create('dbmodelbase', Y.Model, [Y.DbModelSyncExt], {
		
		EVT_ERROR 	: 'error',
		sendParam	: ["process_name", "process_step"],
		url			: "./component/srv/app_coordinator.php", 

		DB_OPERATIONS 	: {
			'create'	: 'set_data',
			'select'  	: 'get_init_data',
			'update'	: 'upd_data',
			'delete'	: 'del_data'
		},
		
		selectedtoJSON: function ( selected ) {
			var attrs = this.getAttrs();
			var tmpattrs = {};
						
			if (selected ){
				selected || [];
				for ( i = 0, len = selected.length; i < len; i++ ){
					tmpattrs[selected[i] ] = attrs[selected[i] ];
				}
				attrs 	= tmpattrs;
			}
			
			attrs["stampid"] = Y.Env.flowApp.keyholder.get("key");	
			return attrs;
		},
		
		
		getParam : function (action, options) {
			var sparam	= new Y.Array(this.sendParam);
			var attrName = (options && options.attrName) ? options.attrName : "";
			if ( attrName === "refreshParams"){
				options.refreshParams = options.newVal;
				options.oldParams = options.oldVal;
			}
			
			var refreshParams = (options && options.refreshParams) ? options.refreshParams : {};
			for (key in refreshParams ) {
				if (Y.Object.owns(refreshParams, key)) {
					this.set(key, refreshParams[key] );
					sparam.push(key); 
				}
			}
			return sparam;
		},
		
		
		getURL: function (action, options) {
			var tmpsend = "";
			var sparam;
			if (action === "read"){
				//
				sparam  = this.getParam(action, options);
				tmpsend = this.url + "?sjon=" + Y.JSON.stringify(this.selectedtoJSON(sparam) );
			} else {
				tmpsend = this.url;
			}
			return tmpsend;
		},
		
		setURL : function (url, action, options) {
			this.url = url;
		},
		
		serialize : function (action){
			Y.log('DbModelioBase : serialize ' + build_count, "info");
			var sparam 	= this.selectedtoJSON(this.sendParam) ;
			var strfy 	= Y.JSON.stringify( sparam );
			return strfy;
		},
		
		parse: function (resp) {
			Y.log("DbModelBase : parse", "info") ;
			if (typeof resp.responseText === 'string') {
				try {
					var jparsed = Y.JSON.parse_uid(resp.responseText);
					return jparsed;
				} catch (ex) {
					this.fire(this.EVT_ERROR, {
						error   : ex,
						response: resp,
						src     : 'parse'
					});

					return null;
				}
			}
			return resp;
		}
		
	}, {
			NAME 		: "DbModelBase",
			ATTRS: {
						
					}
		});
		
	
}, '1.0.1', {"requires": ["model", "dbmodel-sync-rest-ext", "json-parse-uid"]});
