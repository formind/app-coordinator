/* formind 1.0.1 (build 0001) Copyright 2014. */
YUI.add('coordinator-base', function (Y, NAME) {
	
	
	
	var build_count	= "1.0.001",
		Lang		= Y.Lang,
		YObject		= Y.Object,
		isFunction	= Lang.isFunction,
		isString   	= Lang.isString
		View		= Y.View;

	Y.CoordinatorBase = Y.Base.create('coordinatorbase', Y.Base, [Y.View], {
    
		ERROR_CODE  	: "",
		process_name	: "",
		step_id			: 0,
		editors			: null, //Y.EditorDescription,
		appViewMap		: {}, 	// from if app call
		coordDesc 		: null,
		transaction_id	: "",
		coord_config	: {},
		actEditorConfig	: null,
		app_url			: "./component/srv/app_coordinator.php",
    	
		initializer: function (config) {
			
			config || (config = {});
			Y.log("coordinator_base : initializer ", "info");
			
			if ( isString(config.prc_name) ){
				this.coord_config = config;
				Y.log("coordinator_base : initializer " + config.prc_name, "info");
				this.process_name = config.prc_name;
				this.processBuild(this.process_name);
				this.after('stepInitChange', this.stepNextWithName, this);
			}
			
		},
		
		createAppView : function ( viewInfo, config ){
			Y.log("coordinator_base : creatAppView ", "info");
			config || (config = {});
			var step = this.getProcessStepfromName( viewInfo.step_name );
			//step.step_id
			//step.editor_name
			
			var type     = (viewInfo && viewInfo.type) || View,
				ViewConstructor, view;
			// Looks for a namespaced constructor function on `Y`.
			ViewConstructor = isString(type) ?
                YObject.getValue(Y, type.split('.')) : type;
			// Create the view instance and map it with its metadata.
			config.step_name = viewInfo.step_name;
			
			config.container = Y.Node.create("<div id='" + config.step_name + "'></div>");
			
			this.editors[step.step_id].set("view_container", config.container );
			
			view = new ViewConstructor( config );
			
			this.appViewMap[ viewInfo.step_name ] = view;
			view.set("step_id", step.step_id );
			this.actEditorConfig = config;
			return view;
			//return this.step_init( config );
		},
		
		destructor: function () {
		},
		
		/* process handle */ 
		processBuild : function (a_process) {
			this.setStep(0);
			this.processInit(a_process);
		},
		
		processInit : function (a_process) {
			
			this.coordDesc = new Y.CoordinatorDescription();
			this.coordDesc.set("process_name", a_process);
			this.coordDesc.set("process_step", "process_init");
			this.coordDesc.after("load", Y.bind('processStart', this)); 
			this.coordDesc.load();
		   	//			
			this.step_id = "0";
			
		},
		
		onStart : function (transactionid, arguments) {
			this.transactionid = transactionid;
		},

		
		processStart : function(srvresp){
			
			var editor_resp = this.coordDesc.toJSON();//srvresp.parsed;
			
			/* set the editors */
			var eds		 = {};
			var opt		 = {silent : true};
			for (i = 0, len = editor_resp.process_editors.length; i < len; ++i) {
				eds = new Y.EditorDescription();
				eds.setAttrs(editor_resp.process_editors[i], opt );
				//eds.set("container", this.get("container") );
				//eds.save();
				if ( i === 0 ) {
					this.editors = new Y.Array(eds);
					//this.editors[0] = eds;
				} else {
					this.editors.push(eds);
				}
			}
			
		},

		processEnd : function(){
			Y.log("coordinator_base : processEnd", 'info');
		},
		
		setProcessEvent : function( astep_id ){
			var coord_event	= this.coordDesc.get("process_events");
			for (i = 0, len = coord_event.length; i < len; ++i) {
				var prc_step_obj_id		= coord_event[i].obj_id;
				var prc_step_event	 	= coord_event[i].obj_event;
				var on_obj = Y.one(prc_step_obj_id);
				
				if ( on_obj ){
					Y.one(on_obj).detachAll();
					if (coord_event[i].obj_tocall === "step_next"){
						Y.one(on_obj).on(prc_step_event, this.stepNext, this);
					} else {
						var ev_fire = coord_event[i].obj_tocall;
						Y.one(on_obj).on(prc_step_event, this.setFire, this);
					}
				}
			}
		},
		
		setFire : function(ev){
			var obj_target = ev.currentTarget.get("id");
			var coord_event	= this.coordDesc.get("process_events");
			for (i = 0, len = coord_event.length; i < len; ++i) {
				if (coord_event[i].obj_name === obj_target){
					Y.fire(coord_event[i].obj_tocall);
					Y.log("eds fire " + coord_event[i].obj_tocall, "info" );
				}
			}
		},
		
		/* end process handle */
		
		isLastStep : function( astep_name ){
			var coord_contr  = this.coordDesc.get("process_controll");
			var i = 0, j = 0, len = coord_contr.length,
				bfound = false;
			var j = 0, lene = this.editors.length;
			while (i < len && !bfound ) {
				j = 0;
				while ( j < lene && !bfound ){
					if ( this.editors[j].get("step_name") === astep_name ) {
						if ( coord_contr[i].step_name === astep_name && coord_contr[i].last_step === astep_name ){
							bfound  = true;
						}
					}
					j++ ;
				}
				i++;
			}
			return bfound;
		},
		
		getStepIdfromStepName : function( astep_name ){
			var ret	= 0;
			for (i = 0, len = this.editors.length; i < len; ++i) {
				if (astep_name === this.editors[i].get("step_name") ) {
					ret = i;
				}
			}
			return ret;
		},
		
		
		stepInit : function ( config ){
			config || (config = {});
			Y.log("coordinator_base : stepInit ", "info");
			//var a_step_name = config.step.step_name;
			var a_step_name = config.step_name;
			var step_ed = null, a_step, view = null;
			try {
				
				step_ed = this.appViewMap[ a_step_name ];
				if ( !YObject(step_ed) ){
					this._editorCreate(a_step_name);
				}
				a_step = this.getStepIdfromStepName( a_step_name );
				
				this.editors[a_step].set("step_object", step_ed );
				this.editors[a_step].set("view_container", step_ed.get("container") );
				
				if ( this.editors[a_step].get("template_type") === "handlebar" ){
					this._createNodetemplate(a_step);
				} else if ( this.editors[a_step].get("template_type") === "datatable" ){
					step_ed.setWidgetLayout();
				}
				//stepRefreshData : call editor::get_init_data 
				this.step_id = a_step;
				this.stepInitData(a_step_name);
				step_ed.editorInit(); //?
				/*
				step_ed.setParameter(this.editors[a_step].get("editor_in_param") );
				step_ed.editor_init();
				//this.coord_config.step_editor = step_ed;
				//config.editor = step_ed;
				//this.fire("appstepInitChange", { config : config } );
				*/
				return step_ed;
				
			} catch (e) {
				alert("editor create failed " + e );
			}
		},
		
		stepInitData : function( stepName ){
			Y.log("coordinator_base : stepInitData ", "info");
			var asd  = this.editors[this.step_id].get("step_name");
			this.step_id = this.getStepIdfromStepName( stepName );
			var attr = { 	"process_name" : this.coordDesc.get("process_name"),
							"process_step" : "step_init",
							"process_step_name" : stepName
						};
															
			var step_send_param = new Y.EditorDescription() ;
			
			/*step_send_param.addAttr("process_name", {value : this.coordDesc.get("process_name") } );
			step_send_param.addAttr("process_step", {value : "step_init" } );
			step_send_param.addAttr("process_step_name", {value : this.editors[this.step_id].get("step_name") } );
			*/
			step_send_param.setAttrs( attr, {silent : true} );
			step_send_param.after("load", Y.bind('stepRefreshData', this)); 
			step_send_param.load();
		},
		
		
		/* stepInitData : function(){
			var step_send_param = new Y.EditorDescription() ;
			var sendData;
			
			step_send_param.addAttr("process_name", {value : this.coordDesc.get("process_name") } );
			step_send_param.addAttr("process_step", {value : "step_init" } );
			step_send_param.addAttr("process_step_name", {value : this.editors[this.step_id].get("step_name") } );
			step_send_param.save();
			this.srv_req = new Y.ExtIo();
			this.transaction_id = Y.stamp(this.srv_req, true);
			sendData = step_send_param.selectedtoJSON(step_send_param.sendParam);
			var url = this.app_url + "?sjon=" + Y.JSON.stringify(sendData);
			this.iocfg = {	trans_id 	: this.transaction_id,
							method		: 'GET',
							context		: this,
							headers		: {
        					'Content-Type': 'application/json'
							}
			};
			this.srv_req.on('io:complete', Y.bind('stepRefreshData', this));
			this.srv_req.on('io:failure', Y.bind('process_error', this));
			
    		this.srv_req = this.srv_req.send(url, this.iocfg);
		}, */

		
		stepNextWithName : function( config ){
			Y.log("coordinator_base : stepNextWithName");
			if ( this.getStepRequiredCheck( config.step.step_name ) === 1 ){
				this.stepCheck(this.step_id);
				this.stepEnd(this.step_id);
			} else {
				
				var j = 0, lene = this.editors.length,
					bfound = false;
				while ( j < lene && !bfound ){
					if ( this.editors[j].get("step_name") === config.step.step_name ) {
						bfound  = true;
						this.stepInit( config );
					}
					j++ ;
				}
			}
		},
		
		getStepRequiredCheck : function ( req_id ){
			var req_check	 = 0;
			var coord_contr  = this.coordDesc.get("process_controll");
			var coord_events = this.coordDesc.get("process_events");
			var i = 0, j = 0, len = coord_events.length, lenc = coord_contr.length,
				bfound = false;
			while (i < len && !bfound ) {
				if (coord_events[i].obj_name === req_id ){
					while (j < lenc && !bfound ) {
						Y.log("eds step_name " + this.editors[ this.step_id ].get("step_name"), "info" );
						if ( this.editors[ this.step_id ].get("step_name") === coord_contr[j].prev_step ) {
							if ( coord_events[i].obj_param === coord_contr[j].step_name && coord_contr[j].prev_req_check === 1 ){
								req_check = 1;
								bfound = true;
							} else {
								if ( this.editors[ this.step_id ].get("step_name") === coord_contr[j].last_step && coord_contr[j].req_check === 1 ) {
									req_check = 1;
									bfound = true;
								}
							}
						}
						if ( this.editors[ this.step_id ].get("step_name") === coord_contr[j].last_step && coord_contr[j].req_check === 1 ) {
							req_check = 1;
							bfound = true;
						}
						
						j++;
					}
				}
				i++;
			}
			return req_check;
		},
		
		
		getProcessName : function () {
			return this.coordDesc.get("process_name");
		},
		
		setProcessName : function (a_process) {
			this.coordDesc.set("process_name", a_process);
		},
		
		getStep : function( a_step) {
			return this.step_id;
		},
		
		getProcessStepfromId : function( astep_id ){
			var ret	= {};
			for (i = 0, len = this.editors.length; i < len; ++i) {
				if (astep_id === this.editors[i].get("step_id") ) {
					ret.step_id = i;
					ret.editor_name = this.editors[i].get("client_view_type");
				}
			}
			return ret;
		},
		getProcessStepfromName : function( astep_name ){
			var ret	= {};
			for (i = 0, len = this.editors.length; i < len; ++i) {
				if (astep_name === this.editors[i].get("step_name") ) {
					ret.step_id = i;
					ret.editor_name = this.editors[i].get("client_view_type");
				}
			}
			return ret;
		},
		
		getProcessStepIdfromEvent : function( obj_id ){
			var ret	= -1;
			var coord_events = this.coordDesc.get("process_events");
			var i = 0, j = 0, len = coord_events.length, lene = this.editors.length,
				bfound = false;
			while ( i < len && !bfound ) {
				if (coord_events[i].obj_name === obj_id ){
					while ( j < lene && !bfound ){
						if ( this.editors[j].get("step_name") === coord_events[i].obj_param ) {
							bfound  = true;
							ret = j;
						}
						j++ ;
					}
				}
				++i;
			}
			return ret;
		},
		
		processError : function(id, o, args){
		},
		
		setComplete : function() {
			/* if transaction aviable then commit work */
		},
		
		setAbort : function() {
			/* if transaction aviable then rollback work */
		},
		
		
		stepPrev : function(){
		},
				
		stepNext : function ( p_any ){
			if ( p_any ){
				return this.stepNextwithEvent( p_any );
			} else {
				return this.stepEnd(this.step_id);
			}
		},
		
		stepNextwithSequence : function (act_step){
			Y.log("coordinator_base : stepNextwithEvent");
			var vstep_name = this.editors[this.step_id].get("step_name");
			if ( this.isLastStep(vstep_name) ){
				return this.processEnd();
			}
			var coord_contr  = this.coordDesc.get("process_controll");
			var i = 0, j = 0, len = coord_contr.length, lene = this.editors.length,
				bfound = false, vnext_step;
			while ( i < len && !bfound ) {
				if ( coord_contr[i].step_name === vstep_name ){
					bfound = true;
					vnext_step = coord_contr[i].next_step;
					var veditor = this.getProcessStepfromName(vnext_step);
					if ( veditor ){
						this.stepInit( veditor.step_id, veditor.editor_name );
					}
				}
				i++;
			}
		},
		
		stepNextwithEvent : function(ev){
			Y.log("coordinator_base : stepNextwithEvent");
			var obj_id;
			if (ev.currentTarget){
				obj_id = ev.currentTarget.get("id");
				this.step_id = this.getProcessStepIdfromEvent( obj_id );
			} else {
				obj_id = ev.stepNext;
			}
			if ( this.getStepRequiredCheck( obj_id ) === 1 ){
				this.stepCheck(this.step_id);
				this.stepEnd(this.step_id);
			} else {
				var coord_events = this.coordDesc.get("process_events");
				var i = 0, j = 0, len = coord_events.length, lene = this.editors.length,
					bfound = false;
				while ( i < len && !bfound ) {
					if (coord_events[i].obj_name === obj_id ){
						while ( j < lene && !bfound ){
							if ( this.editors[j].get("step_name") === coord_events[i].obj_param ) {
								bfound  = true;
								var eds = this.getProcessStepfromName(coord_events[i].obj_param);
								this.stepInit(eds.step_id, eds.editor_name );
							}
							j++ ;
						}
					}
					++i;
				}
				
			}
		},
		
		stepCheck : function ( ev ){
			this.editors[this.step_id].get("step_object").editorCheck();
		},
		
		stepEnd : function( ev) {
			var step_send_param = new Y.EditorDescription() ;
			var step_param = this.getStepParams( this.step_id ) ;
			step_send_param.set("editor_out_param", step_param );
			step_send_param.set("process_name", this.coordDesc.get("process_name") );
			step_send_param.set("process_step", "step_end" );
			step_send_param.set("process_step_name", this.editors[this.step_id].get("step_name") );
			step_send_param.after("save", Y.bind('getStepSrvResult', this) );
			step_send_param.addTarget(this);
			step_send_param.save();
		},
		
		getStepSrvResult : function ( resp ){
			var f_error = 0;
			if ( resp ){
				var f_error = this.editors[this.step_id].get("step_object").onSrvAnswSuccess(resp.parsed);
				if ( f_error === 0 ){
					f_error = this.stepNextwithSequence(this.step_id);
				}
			}
			return f_error;
		},
		
		stepError : function (id, o, args){
		},
		
		getStepParams : function (a_step) {
			this.editors[this.step_id].get("step_object").getPreParameter();
			var o_params = this.editors[this.step_id].get("step_object").getParameter();
			return o_params;
		},

		setStepParams : function ( a_step, a_descr){
			
		},

		getMaxStep : function() {
			return this.coordDesc.get("process_maxstep");
		},
		
		setStep : function (a_step){
			this.step_id = a_step;
		},

		_getStepTemplate : function (a_step) {
			var jsret = "";
			var	template_data = this.editors[ a_step ].get("view_template");
			for (i = 0, len = template_data.length; i < len; ++i) {
				jsret = jsret.concat(template_data[i].sor_data); 
			}
			if (jsret.length > 0 ){
				var container = Y.one('body');
				if (container) {
					container.append(jsret);
				}
			}
		},
		
		_createNodetemplate : function (a_step){
			this._getStepTemplate(a_step);
			var containerNode = this.editors[ a_step ].get("view_container") ;
			var lworknode = Y.one( this.editors[ a_step ].get('worknode') ),
				source   = Y.one( lworknode ).getHTML(),
				template = Y.Handlebars.compile(source),
				html;
			html = source;
			containerNode.empty();
			containerNode.append(html);
		},
		
		/* end process handle */
		
		stepRefreshData : function( resp ){
			if ( Y.Lang.trim( resp.response.responseText ) === "" ){
				return ;
			}
			var editor_resp = Y.JSON.parse_uid(resp.response.responseText);
			var in_param = editor_resp.process_editors[0].editor_in_param;
			var step_ed = this.editors[this.step_id].get("step_object");
			this.editors[this.step_id].set("editor_in_param", in_param );
			step_ed.setParameter(this.editors[this.step_id].get("editor_in_param") );
			step_ed.render("coordinatorbase:stepRefreshData");
			return step_ed;
		},
		
		render: function ( config ) {
			Y.log("coordinator_base : render ", "info");
			var a_step;
			config || (config = {});
			
			if ( this.editors && this.editors.length >= this.step_id ){
				var vview = this.stepInit( this.actEditorConfig );
				a_step = this.step_id;
				//this.editor_refresh_data(a_step);
				var step_ed = this.editors[a_step].get("step_object");
				//step_ed.setParameter(this.editors[a_step].get("editor_in_param") );
				//step_ed.render();
			}
			
			return step_ed;
		}

		}, {	NAME	 	: "CoordinatorBase",
				ATTRS: {
							worknode	: {value : ""},
							app_name	: {value : ""}
				}
	});

}, '1.0.1', { "requires": ["base-build", "handlebars", "view", "extio", "editor-description", "json-parse-uid", 
							"json-stringify", "editor-base", "obj-params" ] });
