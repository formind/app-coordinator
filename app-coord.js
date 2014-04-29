/*
YUI 3.14.1 (build 63049cb)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/

//------------------------------/
app-coord
formind
Licensed under the BSD License.

*/

YUI.add('app-coord', function (Y, NAME) {

/**
The App Framework provides simple MVC-like building blocks (models, model lists,
views, and URL-based routing) for writing single-page JavaScript applications.

@main app
@module app
@since 3.4.0
**/

/**
Provides a top-level application component which manages navigation and views.

@module app
@submodule app-coord
@since 1.0.1
**/

var Lang    	= Y.Lang,
    YObject 	= Y.Object,
	isString   	= Y.Lang.isString,
    PjaxBase 	= Y.PjaxBase,
    Router   	= Y.Router,
    View     	= Y.View,
	Coordinator = Y.CoordinatorBase,

    getClassName = Y.ClassNameManager.getClassName,

    win = Y.config.win,
	Coordinators = Y.Coordiantor_base;

/**
Provides a top-level application component which manages navigation and views.

This gives you a foundation and structure on which to build your application; it
combines robust URL navigation with powerful routing and flexible view
management.

@class App.Coord
@param {Object} [config] The following are configuration properties that can be
    specified _in addition_ to default attribute values and the non-attribute
    properties provided by `Y.Base`:
  @param {Object} [config.views] Hash of view-name to metadata used to
    declaratively describe an application's views and their relationship with
    the app and other views. The views specified here will override any defaults
    provided by the `views` object on the `prototype`.
@constructor
@extends Base
@uses View
@uses Router
@uses PjaxBase
@since 3.5.0
**/

function AppCoord(){}

/*
}, {
    ATTRS: {
		worknode	: {value : ""},
						
		activeCoord: {
			value   : null,
			readOnly: true
		}
        
    }
};
*/


AppCoord.prototype = {
    // -- Public Properties ----------------------------------------------------

   
    // -- Protected Properties -------------------------------------------------
	actCoord : null,
    /**
    Map of view instance id (via `Y.stamp()`) to view-info object in `views`.

    This mapping is used to tie a specific view instance back to its metadata by
    adding a reference to the the related view info on the `views` object.

    @property _viewInfoMap
    @type Object
    @default {}
    @protected
    @since 3.5.0
    **/

    // -- Lifecycle Methods ----------------------------------------------------
    initializer: function (config) {
		Y.log("App-Coord : initializer ", "info");
        config || (config = {});
		
		var views = {};
        // Merges-in specified view metadata into local `views` object.
        function mergeViewConfig(view, name) {
			if ( isString( view.prc_name ) ){
				view.isCoord = true;
			} else {
				view.isCoord = false;
			}
            views[name] = Y.merge(views[name], view);
        }

        // First, each view in the `views` prototype object gets its metadata
        // merged-in, providing the defaults.
        YObject.each(this.views, mergeViewConfig);

        // Then, each view in the specified `config.views` object gets its
        // metadata merged-in.
        YObject.each(config.views, mergeViewConfig);

        // The resulting hodgepodge of metadata is then stored as the instance's
        // `views` object, and no one's objects were harmed in the making.
        this.views        = views;
        //this._viewInfoMap = {};

        // Using `bind()` to aid extensibility.
        //this.after('activeViewChange', Y.bind('_afterActiveViewChange', this));

       
		/*coord */
		var coords = {};

		// Merges-in specified view metadata into local `views` object.
		function mergeCoordConfig(coord, name) {
			if ( isString( coord.prc_obj ) && coord.prc_obj === "coordinator" ){
				coords[name] = Y.merge(coords[name], coord);
			}
		}
		// First, each view in the `coord-views` prototype object gets its metadata
		// merged-in, providing the defaults.
		YObject.each(this.views, mergeCoordConfig);

		// Then, each view in the specified `config.views` object gets its
		// metadata merged-in.
		//YObject.each(config.views, mergeViewConfig);

		// The resulting hodgepodge of metadata is then stored as the instance's
		// `views` object, and no one's objects were harmed in the making.
		this.coords       = coords;
		this._coordInfoMap = {};
		
		//Y.App.superclass.initializer.apply(this, arguments);
		// Using `bind()` to aid extensibility.
		//			  activeView
		//this.after('activeViewChange', Y.bind('_afterActiveViewChange', this));
		//this.after('activeCoordChange', Y.bind('_afterActiveCoordChange', this));
		//this.after('coordinator_base:appstepInitChange', Y.bind('_after_stepInitChange', this));
    },

    // TODO: `destructor` to destroy the `activeView`?

    // -- Public Methods -------------------------------------------------------
	/* APP COORD START */
	_coordinatorsInit : function( ){
		YObject.each(this.coords, this._coordInit, this );
	},
	
	_coordInit : function (coord, name ) {
		Y.log("AppCoord : coordInit ", "info");
		var coordInfo, coord_type, CoordConstructor, coordstamp;
		var cfg = {};
		coordInfo 	= coord;
		if ( isString( coordInfo.prc_name ) ){
			
			coord_type     = (coordInfo && coordInfo.prc_type) || Coordinator;
			CoordConstructor = Lang.isString(coord_type) ?
				YObject.getValue(Y, coord_type.split('.')) : coord_type;

			delete coordInfo.prc_type;
			
			coord = new CoordConstructor(coordInfo);
			coordstamp = Y.stamp(coord, true);
			coordInfo.instance = coord;
			this._coordInfoMap[coordstamp] = coordInfo;
		}
	},
	
	createCoordView : function(name, viewInfo, config ){
		var bfound = false;
		var coord = null, view;
		coord = this.getCoordInfo(viewInfo.prc_name);
				
		if ( coord ){
			config.view_name = name;
			config.container = this.get("viewContainer");
			view = coord.instance.createAppView(viewInfo, config );
		}
		return view;
	},
	
	
	_afterStepInitChange : function(ev){
		Y.log("App_Coordinator : _after_stepInitChange ", "info");
		
		var viewInfo = this.getViewInfo(ev.config.step.view_name);
		//var coordInfo = this.getCoordInfo(ev.editor.view_name);
		//ev.editor ;
		//viewInfo.instance = ev.config.editor;
		this._viewInfoMap[Y.stamp(ev.config.editor, true)] = viewInfo;
	},
	
	getCoordInfo: function (coord) {
		var vv;
		if (Lang.isString(coord)) {
			function getCoord(coord, name) {
				if ( isString( coord.prc_obj ) && coord.prc_obj === "coordinator" ){
					if ( coord.prc_name === coord.prc_start){
						vv = this.coords[name];
					}
				}
			}
			YObject.each(this.views, getCoord, this);
			return vv;
		}
		return coord && this._coordInfoMap[Y.stamp(coord, true)];
	},
	
	
    /**
    Creates and returns a new view instance using the provided `name` to look up
    the view info metadata defined in the `views` object. The passed-in `config`
    object is passed to the view constructor function.

    This function also maps a view instance back to its view info metadata.

    @method createView
    @param {String} name The name of a view defined on the `views` object.
    @param {Object} [config] The configuration object passed to the view
      constructor function when creating the new view instance.
    @return {View} The new view instance.
    @since 3.5.0
    **/
    createView: function (name, config) {
		Y.log("AppCoord : createView ", "info");
        var viewInfo = this.getViewInfo(name),
            type     = (viewInfo && viewInfo.type) || View,
            ViewConstructor, view;
		if ( viewInfo.isCoord ){
			view = this.createCoordView( name, viewInfo, config );
			viewInfo.instance = view;
		} else {
			// Looks for a namespaced constructor function on `Y`.
			ViewConstructor = Lang.isString(type) ?
					YObject.getValue(Y, type.split('.')) : type;

			// Create the view instance and map it with its metadata.
			view = new ViewConstructor(config);
		}
        this._viewInfoMap[Y.stamp(view, true)] = viewInfo;

        return view;
    },

	showCoord: function (view, config, options, callback) {
		Y.log("AppCoord : showCoord ", "info");
        
        var viewInfo, created;

        options || (options = {});

        // Support the callback function being either the third or fourth arg.
        if (callback) {
            options = Y.merge(options, {callback: callback});
        } else if (Lang.isFunction(options)) {
            options = {callback: options};
        }

        if (Lang.isString(view)) {
            viewInfo = this.getViewInfo(view);

            // Use the preserved view instance, or create a new view.
            // TODO: Maybe we can remove the strict check for `preserve` and
            // assume we'll use a View instance if it is there, and just check
            // `preserve` when detaching?
            if (viewInfo && viewInfo.preserve && viewInfo.instance) {
                view = viewInfo.instance;

                // Make sure there's a mapping back to the view metadata.
                this._viewInfoMap[Y.stamp(view, true)] = viewInfo;
            } else {
                // TODO: Add the app as a bubble target during construction, but
                // make sure to check that it isn't already in `bubbleTargets`!
                // This will allow the app to be notified for about _all_ of the
                // view's events. **Note:** This should _only_ happen if the
                // view is created _after_ `activeViewChange`.

                view    = this.createView(view, config);
                created = true;
            }
        }

        // Update the specified or preserved `view` when signaled to do so.
        // There's no need to updated a view if it was _just_ created.
        if (options.update && !created) {
            view.setAttrs(config);
			var coord = this.getCoordInfo(viewInfo.prc_name);
			if ( coord ){
				coord.instance.stepInitData(viewInfo.step_name);
			}
        }

        // TODO: Hold off on rendering the view until after it has been
        // "attached", and move the call to render into `_attachView()`.

        // When a value is specified for `options.render`, prefer it because it
        // represents the developer's intent. When no value is specified, the
        // `view` will only be rendered if it was just created.
        if ('render' in options) {
            if (options.render) {
                view.render();
            }
        } else if (created ) {
			var coord = null;
			coord = this.getCoordInfo(viewInfo.prc_name);
			if ( coord ){
				this.actCoord = coord;
				view = coord.instance.render();
			} else {
				view.render();
			}
        }

        var rr = this.showView(view, config, options, callback);
		if ( this.actCoord ){
			this.actCoord.instance.setProcessEvent(view.get('step_id'));
		}
		return rr;
    
	},
	
    render: function () {
		Y.log("AppCoord : render ", "info");
		var CLASS_NAMES         = Y.App.CLASS_NAMES,
            container           = this.get('container'),
            viewContainer       = this.get('viewContainer'),
            activeView          = this.get('activeView'),
            activeViewContainer = activeView && activeView.get('container'),
            areSame             = container.compareTo(viewContainer);

        container.addClass(CLASS_NAMES.app);
        viewContainer.addClass(CLASS_NAMES.views);

        // Prevents needless shuffling around of nodes and maintains DOM order.
        if (activeView && !viewContainer.contains(activeViewContainer)) {
            viewContainer.appendChild(activeViewContainer);
        }

        // Prevents needless shuffling around of nodes and maintains DOM order.
        if (!container.contains(viewContainer) && !areSame) {
            container.appendChild(viewContainer);
        }
    	this._coordinatorsInit();
		return this;
    }

    
};   

// -- Namespace ----------------------------------------------------------------
Y.App.Coord = AppCoord;
Y.Base.mix(Y.App, [AppCoord]);


}, '1.0.1', {"requires": ["app-base", "coordinator-base"] });
