YUI.add('coordeditor-base', function (Y, NAME) {
/*
Copyright 2014 formind. All rights reserved.
Licensed under the BSD License.
*/
	var build_count	= "1.0.001";
	
	Y.CoordEditorBase = Y.Base.create('coordeditorbase', Y.View, [], {
        
		ERROR_CODE  	: "",
		renderable		: false,
		
		
		_create_nodetemplate : function (){
			
			var containerNode = this.get("container") ;
			var lworknode = this.get('worknode'),
				wk 		  = Y.one( lworknode ),
				source,
				template,
				html;
			source = wk.getHTML();
			template = Y.Handlebars.compile(source);
			html = source;
			containerNode.empty();
			containerNode.append(html);
		},
		
		editorCheck : function ( ){
		},
		
		editorInit : function ( ){
			//this._create_nodetemplate();
			
		},
		
		onSrvAnswSuccess : function (srv_answ) {
			try {
				if (srv_answ.sys_uid !== "" && srv_answ.result_msg_code === 0 ){
					return 0;
				} else return -1;
			} catch (ex){
				return -1;
			}
		},
		
		onSrvAnswFailure : function (srv_answ) {
		
		},
		
		
		setParameter : function (a_editor_descr){
			this.set("editor_param", a_editor_descr );
		},
		
		setWidgetLayout : function (a_editor_descr){
		},
		
		getPreParameter : function (){
		},
		
		getParameter : function (){
			return this.get("editor_param").toJSON();
		},
		
		stepUpdate : function ( id, resp, args){
		},
		
		setComplete : function ( id, resp, args ){
		},
		
		addSavepoint : function (a_name){
		},
		
		rollbackToSavepoint : function (a_name){
		},
		
		getTagProperty : function (a_col, a_tag){
		},
		
		getError : function (){
		},
		
		
		initializer: function (config) {
			Y.log('CoordEditorBase initializer innen !');
			this.set("container", config.container );
			
		},
	 
		destructor: function () {
			Y.log('CoordEditorBase destructor !');
		},
		
		render : function ( options ){
			
			return this;
		}
		
	}, {	
			NAME		: "CoordEditorBase",
			ATTRS: {
				
				worknode 	 : {value : ""},
				editor_param : {value : null }
			}
		});
	
	}, '1.0.1', { "requires": ["view", "editor-params"]} );
