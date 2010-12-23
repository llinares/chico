/**
  * Chico-UI
  * Packer-o-matic
  * Like the pizza delivery service: "Les than 100 milisecons delivery guarantee!"
  * @components: core, position, positioner, object, floats, navs, carousel, dropdown, layer, modal, tabNavigator, tooltip, validator
  * @version 0.4
  * @autor Natan Santolo <natan.santolo@mercadolibre.com>
  *
  * based on:
  * @package JSMin
  * @package CssMin
  * Stoyan Stefanov on DataURI: 
  * http://www.phpied.com/data-urls-what-are-they-and-how-to-use/ 
  */
;(function($){
/** 
  * @namespace
  */
var ui = window.ui = {

    version: "0.4.6",

    components: "carousel,dropdown,layer,modal,tabNavigator,tooltip,validator",

    internals: "position,positioner,object,floats,navs",

    instances: {},
 	
    init: function() { 
        // unmark the no-js flag on html tag
        $("html").removeClass("no-js");
        // check for pre-configured components
        ui.components = (window.components) ? ui.components+","+window.components : ui.components ;
        // check for pre-configured internals
        ui.internals = (window.internals) ? ui.internals+","+window.internals : ui.internals ;
        // iterate and create components               
        $(ui.components.split(",")).each(function(i,e){ ui.factory({component:e}); });
    },
/**
 *	@static Utils. Common usage functions.
 */		
    utils: {
		body: $('body'),
		html: $('html'),
		window: $(window),
		document: $(document),
		zIndex: 1000,
		index: 0 // global instantiation index
	}
}

/**
*	Factory
*/	
ui.factory = function(o) {

    /**
    *   o {
            component: "chat",
            callback: function(){},
            [script]: "http://..",
            [style]: "http://..",
            [callback]: function(){}    
    *    }
    *
    *	@return A collection of object instances
    */
    
    if (!o) { 
        alert("Factory fatal error: Need and object {component:\"\"} to configure a component."); 
        return;
    };

    if (!o.component) { 
        alert("Factory fatal error: No component defined."); 
        return;
    };

    var x = o.component;

    // If component don't exists in the instances map create an empty array
    if (!ui.instances[x]) {
         ui.instances[x] = []; 
    }

    var create = function(x) { 

        // Send configuration to a component trough options object
        $.fn[x] = function( options ) {

            var results = [];			    
            var that = this;
            var options = options || {};
            
            if (typeof options !== "object") { 
                alert("Factory " + x + " configure error: Need a basic configuration."); 
                return;
            };		
                            
            that.each( function(i, e) {

                var conf = {};
                    conf.name = x;
                    conf.element = e ;
                    conf.id = ui.utils.index++; // Global instantiation index

                $.extend( conf , options );

                // Create a component from his constructor
                var created = ui[x]( conf );

				/* 
						MAPPING INSTANCES
				
				Internal interface for avoid mapping objects
				{
					exists:true,
					object: {}
				}
				*/

				if (created.exists) {				
					// Avoid mapping objects that already exists
					created = created.object;

				} else {								
			        // Map the instance
			        ui.instances[x].push( created );   
				}
	            
	            // Save results to return the created components    
			    results.push( created );

            });
            
            // return the created components or component   
            return ( results.length > 1 ) ? results : results[0];
        }

        // if a callback is defined 
        if ( o.callback ) { o.callback(); }
                        
    } // end create function
    
    if ( ui[o.component] ) {
        // script already here, just create
        create(o.component);
        
    } else {
        // get resurces and call create
        ui.get({
            "method":"component",
            "component":o.component,
            "script": ( o.script )? o.script : "src/js/"+o.component+".js",
            "styles": ( o.style ) ? o.style : "src/css/"+x+".css",
            "callback":create
        });
        
        //alert("UI: " + x + " configuration error. The component do not exists");
    }
}

/**
 *  Get
 */
 
ui.get = function(o) {
    /**
    *   o {
            method: "content"|"component",
            component: "chat",
            [script]: "http://..",
            [style]: "http://..",
            [callback]: function(){}
    *    }
    */
    
    switch(o.method) {

	case "content":
			
		var result;
        var x = o.conf;
        
		x.$htmlContent.html('<div class="loading"></div>');
				
		$.ajax({
			url: x.ajaxUrl,
			type: x.ajaxType || 'POST', // Because ajax.data is sent everytime, Solucion temporal por el modal
			data: x.ajaxParams,
			cache: true,
			async: false, // Because getAjaxContent function returnaba before success and error
			success: function(data, textStatus, xhr){
				result = data;
				if(x.callbacks && x.callbacks.success) x.callbacks.success(data, textStatus, xhr);			
			},
			error: function(xhr, textStatus, errorThrown){
				result = (x.callbacks && x.callbacks.error) ? x.callbacks.error(xhr, textStatus, errorThrown) : "<p>Error on ajax call</p>";
			}
		});
			
		return result;
	
		break;
        
	case "component":
        
        // ui.get: "Should I get a style?"
        if ( o.style ) {
    		var style = document.createElement('link');
        		style.href = o.style;
    	    	style.rel = 'stylesheet';
            	style.type = 'text/css';
        }
        // ui.get: "Should I get a script?"        
        if ( o.script ) {
    	   	var script = document.createElement("script");
    			script.src = o.script;
        }
        
        var head = document.getElementsByTagName("head")[0] || document.documentElement;

		// Handle Script loading
		var done = false;

		// Attach handlers for all browsers
		script.onload = script.onreadystatechange = function() {
    
    	if ( !done && (!this.readyState || 
					this.readyState === "loaded" || this.readyState === "complete") ) {
					
				done = true;
            
	   			// if callback is defined call it
	   	        if ( o.callback ) { o.callback( o.component ); }
									
		   		// Handle memory leak in IE
	   			script.onload = script.onreadystatechange = null;
   			
		   		if ( head && script.parentNode ) { head.removeChild( script ); }
			}
		};
            
		// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
		// This arises when a base node is used.
		if ( o.script ) { head.insertBefore( script, head.firstChild ); }
		if ( o.style ) { head.appendChild( style ); }
    
		break;        
    }

}

/**
*  @static @class Positionator
*	@author <a href="mailto:leandro.linares@mercadolibre.com">Leandro Linares</a>
*	@author <a href="mailto:guillermo.paz@mercadolibre.com">Guillermo Paz</a>
*  @function 
*/	

ui.position = {
	// Vertical & horizontal alignment
	center: function(conf){
		var align = function(){
			conf.$htmlContent.css({
				left: (parseInt(ui.utils.window.width()) - conf.$htmlContent.outerWidth() ) /2,
				top: (ui.utils.html.hasClass('ie6')) ? '' : (parseInt(ui.utils.window.height()) - conf.$htmlContent.outerHeight() ) /2
			});
		};
		align();
		ui.utils.window.bind('resize', align);
	},
	
	// Layer, drop, mega-drop
	down: function(conf){
		var align = function(){
			conf.$htmlContent.css({
				top: conf.$wrapper.outerHeight() + 10,
				left: (conf.$wrapper.outerWidth() / 2) - 20
			});
		};
		align();
		ui.utils.window.bind('resize', align);
	},
	
	// Helpers
	right: function(conf){		
		var align = function(){
			conf.$htmlContent.css({
				top: (conf.$wrapper.height() / 2) - 11,
				left: conf.$wrapper.outerWidth() + 13
			});
		};
		align();
		ui.utils.window.bind('resize', align);
	},		
	
	// Tooltip
	follow: function(conf){
		conf.$trigger.bind('mousemove', function(event){
			conf.$htmlContent.css({
				top: event.pageY + 20,
				left: event.pageX - 32
			});
		});
	}
}
// @arg o == configuration
ui.positioner = function( o ) {

/*   References
     points: x, y 
         x values: center, left, right
         y values: middle, top, bottom
         
     examples:
         "cm" = center middle
         "tl" = top left
         "tr" = top right
         "bl" = bottom left
         "br" = bottom right

    example configuration:
    {
        element: $element
        [context]: $element | viewport
        [offset]: "x y" 
        [points]: "cm cm" // default
        [fixed]: false // default
        [draggable]: false // default
        
    } */
    
    // Initial configuration
	var element = $(o.element);
	var context;
    
	// Default parameters
	if(!o.points) o.points = "cm cm";    
    if(!o.offset) o.offset = "0 0";
    
    // Class names
    var classReferences = {
		"lt lb": "down",
		"lb lt": "top",
		"rt rb": "down",
		"rb rt": "top",
		"lt rt": "right"
	};
	
	// Offset parameter
    var splittedOffset = o.offset.split(" ");
   	var offset_left = parseInt(splittedOffset[0]);
	var offset_top = parseInt(splittedOffset[1]);
	
    // Get viewport with your configuration - Crossbrowser
	var getViewport = function() {
    	var viewport;
    	var width;
 		var height;
 		var left;
 		var top;
 				
	 	// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
		if (typeof window.innerWidth != "undefined") {
			viewport = window;
			width = viewport.innerWidth;
			height = viewport.innerHeight;
			left = 0 + offset_left + viewport.pageXOffset;
			top = 0 + offset_top + viewport.pageYOffset;
			bottom = height + viewport.pageYOffset;
			right = width + viewport.pageXOffset;
		
		// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
		// older versions of IE - viewport = document.getElementsByTagName('body')[0];
		} else if (typeof document.documentElement != "undefined" && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
			viewport = document.documentElement;
			width = viewport.clientWidth;
			height = viewport.clientHeight;
			left = 0 + offset_left + viewport.scrollLeft;
			top = 0 + offset_top + viewport.scrollTop;
			bottom = height + viewport.scrollTop;
			right = width + viewport.scrollLeft; 
		}

		// Return viewport object
		return {
			element: viewport,			
			left: left,
			top: top,
			bottom: bottom,
			right: right,
			width: width,
			height: height
		}
    };
    
	// Calculate css left and top to element on context
	var getPosition = function(unitPoints) {		     
		// my_x and at_x values together
		var xReferences = {
			ll: context.left,
			lr: context.left + context.width,
			rr: context.left + context.width - element.outerWidth(),
			cc: context.left + context.width/2 - element.outerWidth()/2
			// TODO: lc, rl, rc, cl, cr
		}
		
		// my_y and at_y values together
		var yReferences = {
			tt: context.top,
			tb: context.top + context.height,
			bt: context.top - element.outerHeight(),
			mm: context.top + context.height/2 - element.outerHeight()/2
			// TODO: tm, bb, bm, mt, mb
		}
		
		var axis = {
			left: xReferences[unitPoints.my_x + unitPoints.at_x],
			top: yReferences[unitPoints.my_y + unitPoints.at_y]	
		} 

		return axis;
	};
	
	// Evaluate viewport spaces and set points
	var calculatePoints = function(points, unitPoints){	
		
		// Default styles
        var styles = getPosition(unitPoints);
        	styles.direction = classReferences[points];
        
        // Check viewport limits
		var viewport = getViewport();
		
		// Down to top
		if ( ( points == "lt lb" ) && ( (styles.top + element.outerHeight()) > viewport.bottom) ) { // Element bottom > Viewport bottom
			unitPoints.my_y = "b";
			unitPoints.at_y = "t";
			
			// New styles
			styles = getPosition(unitPoints);
			styles.direction = "top";
			styles.top -= context.height; // TODO: Al recalcular toma al top del context como si fuese el bottom. (Solo en componentes. En los tests anda ok)
		};
		
		/*// Right to down
		if ( (styles.left + element.outerWidth()) > viewport.right ) { // Element right > Viewport right
			unitPoints.my_x = "l";
			unitPoints.my_y = "t";
			unitPoints.at_x = "l";
			unitPoints.my_y = "t";
			
			// New styles
			styles = getPosition(unitPoints);
			styles.direction = "down";
		};*/
		
		return styles;
	};
	
	
	// Set position to element on context
	var setPosition = function(points) {
		// Separate points config
        var splitted = points.split(" ");
        
        var unitPoints = {
        	my_x: splitted[0].slice(0,1),
        	my_y: splitted[0].slice(1,2),
        	at_x: splitted[1].slice(0,1),
        	at_y: splitted[1].slice(1,2)
        }
        
		var styles = calculatePoints(points, unitPoints);
		
		element
			.css({
				left: styles.left,
				top: styles.top
			})
			.removeClass( "ch-top ch-left ch-down ch-right" )
			.addClass( "ch-" + styles.direction );
	};	
	
	// Get context object and set element position
    var initPosition = function(){
    	// Context by parameter
    	if (o.context) {
    		
		    var contextOffset = o.context.offset();
		    context = {
		    	element: o.context,
				top: contextOffset.top + offset_top,
				left: contextOffset.left + offset_left,
				width: o.context.outerWidth(),
				height: o.context.outerHeight()
		    };
		    
		// Viewport as context
	    } else {
			context = getViewport();
	    };
	    
	    // Set element position	    
	    setPosition(o.points);
	    
    };
    
    // Init
    
    initPosition();    
   	ui.utils.window.bind("resize scroll", initPosition);
   	return $(element);
};

/**
*	Creates a new Object.
*  Represent the abstract class of all ui objects.
*/	
ui.object = function(){
	
	var that = this;
	
	return {
				
		prevent: function(event){
			if (event) {
			    event.preventDefault();
				event.stopPropagation();
			}
		},
		
		/*
		conf.content
		conf.content: "selector css" || "<tag>texto plano</tag>" || "texto plano"	
		conf.ajax
		conf.ajax:true (levanta href o action) || "http://www..." || "../test/test.html"
		*/
		loadContent: function(conf) {
			// Properties validation
			if (conf.ajax && conf.content) { alert('UI: "Ajax" and "Content" can\'t live together.'); return; };

			// Returns css selector, html code or plain text as content
			if (!conf.ajax) return ($(conf.content).length > 0) ? $(conf.content).clone().show() : conf.content;

			// Return Ajax content from ajax:true
			if (conf.ajax === true) {
				
				// Load URL from href or form action
				conf.ajaxUrl = conf.$trigger.attr('href') || conf.$trigger.parents('form').attr('action');
				
				// Ajax parameters
				conf.ajaxParams = 'x=x'; // TODO refactor con el header de ajax
				
				// If trigger is a form button...
				if(conf.$trigger.attr('type') == 'submit'){
					conf.ajaxType = conf.$trigger.parents('form').attr('method') || 'POST';
					var serialized = conf.$trigger.parents('form').serialize();
					conf.ajaxParams = conf.ajaxParams + ((serialized != '') ? '&' + serialized : '');
				};

				// Returns ajax results
				return ui.get({method:"content", conf:conf}) || '<p>Error on ajax call</p>';

			// Returns Ajax content from ajax:URL
			} else if ( conf.ajax.match(/(?:(?:(https?|file):\/\/)([^\/]+)(\/(?:[^\s])+)?)|(\/(?:[^\s])+)/g) ) { // Relatives and absolutes url regex
				// Set url
				conf.ajaxUrl = conf.ajax;

				// Ajax parameters
				conf.ajaxParams = 'x=x'; // TODO refactor con el header de ajax

				// Returns ajax results
				return ui.get({method:"content", conf:conf});
			
			// Invalid Ajax parameter
			} else {
				alert('UI: "Ajax" attribute error.'); return;				
			};

		},
		
		callbacks: function(conf, when){
			if(conf.callbacks && conf.callbacks[when]) conf.callbacks[when](conf);
		},
        
        publish: { 
            // The publish Object will be returned in all instanced component, all public methods and properties goes here.
        }

	};
}
/**
*  @static @class Floats. Represent the abstract class of all floats ui objects.
*  @requires ui.object
*  @returns {Object} New Floats.
*/
ui.floats = function(){
	var that = ui.object(); // Inheritance	
    
	var clearTimers = function(){
		clearTimeout(st);
		clearTimeout(ht);
	};

	var createClose = function(conf){
		$('<p class="btn close">x</p>').bind('click', function(event){
			that.hide(event, conf);
		}).prependTo(conf.$htmlContent);
	};

	var createCone = function(conf){
		$('<div class="cone"></div>').prependTo(conf.$htmlContent);
	};

	that.show = function(event, conf){
		that.prevent(event);
		
		if(conf.visible) return;
		
		conf.$htmlContent = $('<div class="ch-' + conf.name + '">');

		conf.$htmlContent
			.hide()
			.css("z-index", ui.utils.zIndex++)
			.appendTo("body")
			.html( that.loadContent(conf) );
				
		// Visual configuration
		if(conf.closeButton) createClose(conf);
		if(conf.cone) createCone(conf);
		if(conf.classes) conf.$htmlContent.addClass(conf.classes);	
		
		// Positioner
		conf.position.element = conf.$htmlContent;
		ui.positioner(conf.position);

		// Show
		conf.visible = true;
		conf.$htmlContent.fadeIn('fast', function(){ that.callbacks(conf, 'show'); });			
	};

	that.hide = function(event, conf){
		that.prevent(event);
		
		if(!conf.visible) return;
		
		conf.$htmlContent.fadeOut('fast', function(event){ $(this).remove(); });	
		
		// Hide
		conf.visible = false;
		that.callbacks(conf, 'hide');
	};

	return that;
}

/**
*  @static @class Navigators. Represent the abstract class of all navigators ui objects.
*  @requires PowerConstructor
*  @returns {Object} New Navigators.
*/	
ui.navs = function(){
	var that = ui.object(); // Inheritance
	
	that.status = false;
		
	that.show = function(event, conf){
		that.prevent(event);
		that.status = true;
		conf.$trigger.addClass('on');
		conf.$htmlContent.show();
		
		that.callbacks(conf, 'show');
	};
	
	that.hide = function(event, conf){
		that.prevent(event);
		that.status = false;
		conf.$trigger.removeClass('on');
		conf.$htmlContent.hide();
		
		that.callbacks(conf, 'hide');
	};		
	
	return that;
}
/**
 *	Carousel
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.carousel = function(conf){
	var that = ui.object(); // Inheritance
	var status = false;

	// Global configuration
	conf.$trigger = $(conf.element).addClass('ch-carousel');
	conf.$htmlContent = $(conf.element).find('.carousel').addClass('ch-carousel-content'); // TODO: wrappear el contenido para que los botones se posicionen con respecto a su contenedor
    conf.publish = that.publish;

	// UL Width calculator
	var htmlElementMargin = ($.browser.msie && $.browser.version == '6.0') ? 21 : 20;//IE necesita 1px de mÃ¡s
	var htmlContentWidth = conf.$htmlContent.children().size() * (conf.$htmlContent.children().outerWidth() + htmlElementMargin);
	
	// UL configuration
	conf.$htmlContent
		.wrap($('<div>').addClass('mask'))//gracias al que esta abajo puedo leer el $mask.width()
		.css('width', htmlContentWidth);
		
	// Mask Object	
	var $mask = conf.$trigger.find('.mask');

	// Steps = (width - marginMask / elementWidth + elementMargin)
	var steps = ~~( (conf.$trigger.width() - 70) / (conf.$htmlContent.children().outerWidth() + 20));
		steps = (steps == 0) ? 1 : steps;	

	// Move to... (steps in pixels)
	var moveTo = (conf.$htmlContent.children().outerWidth() + 20) * steps;

	// Mask configuration
	var margin = ($mask.width()-moveTo) / 2;
	$mask.width( moveTo ).height( conf.$htmlContent.children().outerHeight() );
	if(conf.arrows != false) $mask.css('marginLeft', margin);
	
	var prev = function(event) {
		if(status) return;//prevButton.css('display') === 'none' limit public movement
		
		var htmlContentPosition = conf.$htmlContent.position();
		
		status = true;
		
		conf.$htmlContent.animate({ left: htmlContentPosition.left + moveTo }, function(){
			htmlContentPosition = conf.$htmlContent.position();			
			if(htmlContentPosition.left >= 0) prevButton.hide();
			nextButton.show();
			status = false;
		});
        
        // return publish object
        return conf.publish;
	}
	
	//En IE6 al htmlContentWidth por algun motivo se le suma el doble del width de un elemento (li) y calcula mal el next()
	if($.browser.msie && $.browser.version == '6.0') htmlContentWidth = htmlContentWidth - (conf.$htmlContent.children().outerWidth()*2);
	
	var next = function(event){
		if(status) return;//nextButton.css('display') === 'none' limit public movement
		
		var htmlContentPosition = conf.$htmlContent.position(); // Position before moving
		
		status = true;
		
		conf.$htmlContent.animate({ left: htmlContentPosition.left - moveTo }, function(){
			htmlContentPosition = conf.$htmlContent.position(); // Position after moving
			if(htmlContentPosition.left + htmlContentWidth <= $mask.width()) nextButton.hide();
			prevButton.show();
			status = false;
		});		

        // return publish object
        return conf.publish;
	}
	
	// Create buttons
	var prevButton = $('<p>')
		.html('Previous')
		.addClass('prev')
		.bind('click', prev)
		.hide()
		.css('top', (conf.$htmlContent.children().outerHeight() - 57) / 2 + 10); // 57 = button height | 10 = box padding top

	var nextButton = $('<p>')
		.html('Next')
		.addClass('next')
		.bind('click', next)
		.hide()
		.css('top', (conf.$htmlContent.children().outerHeight() - 57) / 2 + 10); // 57 = button height | 10 = box padding top
	
	
	
	if (conf.arrows != false) {
		// Append buttons
		conf.$trigger.prepend(prevButton).append(nextButton);
		// Si el ancho del UL es mayor que el de la mascara, muestra next
		if(htmlContentWidth > $mask.width()){ nextButton.show();}
	}

    // create the publish object to be returned

        conf.publish.uid = conf.id;
        conf.publish.element = conf.element;
        conf.publish.type = "ui.carousel";
        conf.publish.next = function(){ return next($.Event()); };
        conf.publish.prev = function(){ return prev($.Event()); };

	return conf.publish;
}
/**
 *	Dropdown
 *	@author 
 *	@Contructor
 *	@return An interface object
 */	
ui.dropdown = function(conf){
	var that = ui.navs(); // Inheritance

	// Global configuration
	$(conf.element).addClass('ch-dropdown');
	conf.$trigger = $(conf.element).children(':first');
	conf.$htmlContent = conf.$trigger.next().bind('click', function(event){ event.stopPropagation() });
    conf.publish = that.publish;
	
	// Methods
	var show = function(event){ 

        that.show(event, conf);

        // return publish object
        return conf.publish;  
    };
	
    var hide = function(event){ 

        that.hide(event, conf); 

        // return publish object
        return conf.publish; 
    };
    
	// Trigger
	conf.$trigger
		.bind('click', function(event){
			if(that.status){ that.hide(event, conf); return; };
			
			// Reset all dropdowns
			$(ui.instances.dropdown).each(function(i, e){ e.hide() });
			
			that.show(event, conf);
		
			// Document events
			$(document).bind('click', function(event){
				//that.hide(event, conf);
                hide(event);
				$(document).unbind('click');
			});
		})
		.css('cursor','pointer')
		.addClass('ch-dropdown-trigger')
		.append('<span class="down">&raquo;</span>');
	
	// Content
	conf.$htmlContent
		.addClass('ch-dropdown-content')
		.css('z-index', ui.utils.zIndex++)
		.find('a')
			.bind('click', function(){ hide($.Event()) });

    // create the publish object to be returned
        conf.publish.uid = conf.id,
        conf.publish.element = conf.element,
        conf.publish.type = "ui.dropdown",
        conf.publish.show = function(event){ return show(event, conf) },
        conf.publish.hide = function(event){ return hide(event, conf) }

	return conf.publish;

};
/**
 *	Context Layer
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.layer = function(conf){
	var that = ui.floats(); // Inheritance

	// Global configuration
	conf.$trigger = $(conf.element);
	conf.cone = true;
	conf.classes = 'box';
	conf.visible = false;	
	conf.position = {
   		context: conf.$trigger,
        offset: "0 10",
		points: "lt lb"
    }
    conf.publish = that.publish;


    var show = function(event) {
        
        that.show(event, conf);				

        if (conf.event === "click") {
            
            $('.ch-layer').bind('click', function(event){ event.stopPropagation() });
								
            // Document events
            $(document).bind('click', function(event){
                that.hide(event, conf);
                $(document).unbind('click');
            });
        }

        // return publish object
        return conf.publish;    
    }

    var hide = function(event) {
        
        that.hide(event, conf);
        
        // return publish object
        return conf.publish;
    }
    
    var position = function(event){
		ui.positioner(conf.position);
		
		return conf.publish;
	}

	// Click
	if(conf.event === 'click'){
		// Local configuration
		conf.closeButton = true;

		// Trigger events
		conf.$trigger
			.css('cursor', 'pointer')
			.bind('click',show);

	// Hover
	}else{
		// Trigger events
		conf.$trigger
			.css('cursor', 'default')
			.bind('mouseover', show)
			.bind('mouseout', hide);
	};

    // create the publish object to be returned

        conf.publish.uid = conf.id,
        conf.publish.element = conf.element,
        conf.publish.type = "ui.layer",
        conf.publish.content = (conf.content) ? conf.content : conf.ajax,
        conf.publish.show = function(event){ return show(event, conf) },
        conf.publish.hide = function(event){ return hide(event, conf) },
        conf.publish.position = function(event){return position(event) }

	return conf.publish;
    
};
/**
 *	Modal window
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.modal = function(conf){
	var that = ui.floats(); // Inheritance
	
	// Global configuration
	conf.$trigger = $(conf.element);
	conf.closeButton = true;
	conf.classes = 'box';
	conf.position = {
		fixed:true
	};
	conf.publish = that.publish;
			
	
	// Methods Privates
	var show = function(event){
		dimmer.on();
		that.show(event, conf);
		$('.ch-modal .btn.close, .closeModal').bind('click', hide);
		conf.$trigger.blur();
        
        // return publish object
        return conf.publish;        
	};

	var hide = function(event){
		dimmer.off();
		that.hide(event, conf);

        // return publish object
        return conf.publish;
	};
	
	var position = function(event){
		ui.positioner(conf.position);
		
		// return publish object
		return conf.publish;
	}

	// Dimmer
	var dimmer = {
		on:function(){
			$('<div>').bind('click', hide).addClass('ch-dimmer').css({height:$(window).height(), display:'block', zIndex:ui.utils.zIndex++}).hide().appendTo('body').fadeIn();
			/*ui.positioner({
				element: $('.ch-dimmer'),
				fixed: true,
				points: 'lt lt'
			});*/
			//$('.ch-dimmer').fadeIn();
		},
		off:function(){
			$('div.ch-dimmer').fadeOut('normal', function(){ $(this).remove(); });
		}
	};
	

	// Events
	conf.$trigger
		.css('cursor', 'pointer')
		.bind('click', show);
		
        // create the publish object to be returned
        conf.publish.uid = conf.id,
        conf.publish.element = conf.element,
        conf.publish.type = "ui.modal",
        conf.publish.content = (conf.content) ? conf.content : ((conf.ajax === true) ? (conf.$trigger.attr('href') || conf.$trigger.parents('form').attr('action')) : conf.ajax),
        conf.publish.show = function(event){ return show(event) },
        conf.publish.hide = function(event){ return hide(event) },
        conf.publish.position = function(event){return position(event) }

	return conf.publish;

};
/**
 *	Tabs Navigator
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.tabNavigator = function(conf){

    var that = ui.object();
    
    conf.publish = that.publish;

	var $triggers = $(conf.element).children(':first').find('a');
	var $htmlContent = $(conf.element).children(':first').next();
	var instances = [];

	// Global configuration
	$(conf.element).addClass('ch-tabNavigator');
	$(conf.element).children(':first').addClass('ch-tabNavigator-triggers');
	$triggers.addClass('ch-tabNavigator-trigger');
	$htmlContent.addClass('ch-tabNavigator-content box');

	// Starts (Mother is pregnant, and her children born)
	$.each($triggers, function(i, e){
		instances.push(ui.tab(i, e, conf));
	});
    
    // TODO: Normalizar las nomenclaturas de mÃ©todos, "show" deberÃ­a ser "select"
	var show = function(event, tab){
		//ui.instances.tabNavigator[conf.instance].tabs[tab].shoot(event);
		        
        instances[tab].shoot(event);
        
        /* The potato is ready!!
		Use this to execute a specific tab on console (on h1 click)
		$('h1').click(function(event){
			ui.instances.tabNavigator[0].show(event, 2);
		});*/

        // return publish object
        return conf.publish; 
	};
    
    // create the publish object to be returned

        conf.publish.uid = conf.id,
        conf.publish.element = conf.element,
        conf.publish.type = "ui.tabNavigator",
        conf.publish.tabs = instances,
        conf.publish.select = function(tab){ return show($.Event(), tab) }
    
	return conf.publish;
};


/**
 *	Tab
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.tab = function(index, element, conf){
	var that = ui.navs(); // Inheritance
	var display = element.href.split('#');
	var $tabContent = $(element).parents('.ch-tabNavigator').find('#' + display[1]);

	// Global configuration
	that.conf = {
		name: 'tab',
		$trigger: $(element).addClass('ch-tabNavigator-trigger'),
		callbacks: conf.callbacks
	};

	var results = function(){
		
        // If there are a tabContent...
		if ( $tabContent.attr('id') ) {
			return $tabContent; 		
		// If tabContent doesn't exists        
		} else {
			// Set ajax configuration
			that.conf.ajax = true;
						
			// Create tabContent
			var w = $('<div>').attr('id', 'ch-tab' + index);
				w.hide().appendTo( that.conf.$trigger.parents('.ch-tabNavigator').find('.ch-tabNavigator-content') );
			return w;
		};
	};
	that.conf.$htmlContent = results();

	// Open first tab by default
	if(index == 0){
		that.status = true;
		that.conf.$trigger.addClass('on');
	};

	// Hide all closed tabs
	if(!that.status) that.conf.$htmlContent.hide();

	// Process show event
	that.shoot = function(event){
		that.prevent(event);
		var tabs = ui.instances.tabNavigator[conf.id].tabs; // All my bros
		if(tabs[index].status) return; // Don't click me if I'm open

		// Hide my open bro
		$.each(tabs, function(i, e){
			if(e.status) e.hide(event, e.conf);
		});

		// Load my content if I'need an ajax request
		if(that.conf.$htmlContent.html() === '') that.conf.$htmlContent.html( that.loadContent(that.conf) );

		// Show me
		that.show(event, that.conf);
	};

	// Events
	that.conf.$trigger.bind('click', that.shoot);

	return that;
}
/**
 *	Tooltip
 *	@author 
 *	@Contructor
 *	@return An interface object
 *  @memberOf ui.Floats
 */

ui.tooltip = function(conf){
	var that = ui.floats(); // Inheritance

	conf.name = 'tooltip';
	conf.cone = true;
	conf.content = conf.element.title;	
	conf.visible = false;   	
   	conf.position = {
   		context: $(conf.element),
        offset: "0 10",
		points: "lt lb"
    }
	conf.publish = that.publish;

    var show = function(event) {
        $(conf.element).attr('title', ''); // IE8 remembers the attribute even when is removed, so ... empty the attribute to fix the bug.
		that.show(event, conf);
        
        // return publish object
        return conf.publish;  
    }
	
    var hide = function(event) {
		$(conf.element).attr('title', conf.content);
		that.hide(event, conf);

        // return publish object
        return conf.publish;
    }
    
    var position = function(event){
		ui.positioner(conf.position);
		
		return conf.publish;
	}
            	
	conf.$trigger = $(conf.element)
		.css('cursor', 'default')
		.bind('mouseenter', show)
		.bind('mouseleave', hide);
    
    // create the publish object to be returned

        conf.publish.uid = conf.id,
        conf.publish.element = conf.element,
        conf.publish.type = "ui.tooltip",
        conf.publish.content = conf.content,
        conf.publish.show = function(event){ return show(event, conf) },
        conf.publish.hide = function(event){ return hide(event, conf) },
        conf.publish.position = function(event){return position(event) }
        
	return that.publish;
};
/**
 *	Validator
 *	@author 
 *	@Contructor
 *	@return An interface object
 */

ui.validator = function(conf){
	var that = ui.object(); // Inheritance
	var validation = true;
	var watchers = [];
	
	// Reset default events
	$(conf.element).bind('submit', function(event){ that.prevent(event); });
	$(conf.element).find('input[type=submit]').unbind('click'); // Delete all click handlers asociated to submit button
	
	// Watcher constructor
	var Watcher = function(wconf){

		// Checkbox and radio button special config
		if(wconf.$element.hasClass('options')){
			wconf.tag = 'OPTIONS';
			if(wconf.$element.hasClass('required')){
			
				var getInlineTrigger = function(){
					var h4 = wconf.$element.find('h4');
					h4.wrapInner('<span>');
					return h4.children();
				};
				
				wconf.$element = ( // Required trigger (h4 or legend or element -helper will be fire from here-)
					( (wconf.$element.find('h4').length > 0) ? getInlineTrigger() : false ) || // if exists H4, get H4
					( (wconf.$element.prev().attr('tagName') == 'LEGEND') ? wconf.$element.prev() : false ) || // if previous element is a legend tag, get previous element
					wconf.$element // element
				);
				
			};
		
			// TODO: en el blur de los options tienen que validar que este ok
		
		// Input, select, textarea
		}else{
			wconf.$element.bind('blur', function(event){
				wconf.event = event;
				watchers[wconf.id].status = validate(wconf);
			});
		};
    
		return { 
			status: true, 
			helper: ui.helper( wconf ),
			element: wconf.$element[0],
			validate: function(){ validate(wconf) }
		};
 	};
	
	// Validate
	var validations = function(method, wconf){
		var value = wconf.$element.val();
		
		switch(method){
			case 'text':		return value.match(/^([a-zA-Z\s]+)$/m); break;
			case 'number':		return !isNaN(value);/*value.match(/^\d+$/m);*/ break;
			case 'email':		return value.match(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i); break;
			case 'url':			return value.match(/^(http:\/\/www.|https:\/\/www.|ftp:\/\/www.|www.){1}([\w]+)(.[\w]+){1,2}$/); break;
			case 'range':		return validations('number', wconf) && validations('min', wconf) && validations('max', wconf); break;
			case 'required':	return (wconf.tag == 'SELECT') ? value != -1 : $.trim(value).length > 0; break; // Select vs. input, options, textarea
			case 'min':			return value >= parseInt(wconf.$element.attr('min')); break;
			case 'max':			return value <= parseInt(wconf.$element.attr('max')); break;
			case 'minLength':	return value.length >= parseInt(wconf.messages.minLength[0]); break;
			case 'maxLength':	return value.length <= parseInt(wconf.messages.maxLength[0]); break;
		};
	};
	
	var validate = function(wconf){ // TODO: onBlur, si sigue con error tiene que validar otra vez
		var helper = watchers[wconf.id].helper;

		// Each validation
		for(var x in wconf.messages){
			// Don't validate disabled elements
			if(wconf.$element.parents('label').hasClass('disabled') && wconf.$element.attr('disabled')) break;
			
			// Don't validate not required elements (Si no es obligatorio y el campo esta vacio, esta todo ok)
			if(!wconf.$element.parents('label').hasClass('required') && !validations('required', wconf)) break;
			
			// Status error (cut the flow)
			if(!validations(x, wconf)){
				// Executed on Blur
				if(wconf.event.type == 'blur') return false;
				
				// Executed on Submit
				wconf.$element.addClass('error');
				if($('.helper' + wconf.id)) helper.hide(); // TODO: refactor del hide del helper
				// Show helper (min/maxLength message vs. normal message)
				if(x == 'minLength' || x == 'maxLength') helper.show(wconf.messages[x][1]); else helper.show(wconf.messages[x]);
				return false;
			};
		};
		
		// Status ok
		// With previous error...
		if(wconf.$element.hasClass('error')){ helper.hide(); wconf.$element.removeClass('error'); };
		
		// Executed on Submit
		if(wconf.event.type === 'submit') return true;
		
		// Executed on Blur (General error checker)
		validation = true; // Reset general status
		$.each(watchers, function(i, e){ if(i != wconf.id && !e.status) validation = false }); // Check each watcher status except current watcher, because this time it's true
		if(validation) removeValidation(); // Remove top helper if no errors
		return true;
	};
	
	// Remove big helper
	var removeValidation = function(){
		$('.ch-validator').fadeOut('fast', function(){ $(this).remove(); });
		$('.ch-helper').each(function(i,e){ $(e).css('top', parseInt($(e).css('top')) - $('.ch-validator').height() - 20); }); // TODO: temp solution
	};

	// Form events
	$(conf.element).bind('submit', function(event){
		that.prevent(event);
		
		// Reset form status
		if(!validation){ removeValidation(); validation = true; };
		
		// Validate each field
		var index = 0;
		for(var x in conf.fields){
			var helper = watchers[index].helper;
			
			// Input, select, textarea
			if(!$(x).hasClass('options')){
				// Watcher configuration
				var wconf = {
					id: index,
					$element: $(x),
					tag: $(x).attr('tagName'),
					messages: conf.fields[x],
					event: event
				};
				
				// Error
				if(!validate(wconf)){					
					watchers[index].status = false;
					validation = false;
				// Ok (clean field error)
				}else{
					$(x).removeClass('error');
					helper.hide();
				};
			
			// Checkbox, Radio button (Options)
			}else{
				// Error
				if($(x).find('input:checked').length === 0){
					if($('.helper' + index)) helper.hide(); // TODO: refactor del hide del helper
					helper.show(conf.fields[x]['required']);
					watchers[index].status = false;
					validation = false;
				// Ok (clean field error)
				}else{
					helper.hide();
				};
			};
			
			// Increase index
			index ++;
		};
		
		// General error
		if(!validation){
			$(conf.element).before('<p class="ch-validator"><span class="ico error">Error: </span>' + conf.defaults.error + '</p>');
			$('.ch-helper').each(function(i,e){ $(e).css('top', parseInt($(e).css('top')) + $('.ch-validator').height() + 20); }); // TODO: temp solution
		// General ok
		}else{
			removeValidation();
			// Callback vs. submit
			if(conf.callbacks && conf.callbacks.submit) conf.callbacks.submit(); else conf.element.submit();
		};
	});

	
	// Create each Watcher
	for(var x in conf.fields){
		var wconf = {
			id: watchers.length, // because length is: 0, 1, 2, 3...
			$element: $(x),
			tag: $(x).attr('tagName'), // INPUT, SELECT, TEXTAREA, OPTIONS
			messages: conf.fields[x]
		};

		watchers.push( Watcher( wconf ) );
	};

	
    // create the publish object to be returned

    that.publish = {
        uid: conf.id,
        element: conf.element,
        type: "ui.validator",
        fields: watchers,
        validate: function(event){ validate() }
    }
    
    return that.publish;

};


/**
 *	Helper
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.helper = function(wconf){
	var that = ui.floats(); // Inheritance

	// Global configuration
	var conf = {
		name: 'helper',
        $trigger: wconf.$element,
		cone: true,
		classes: 'helper' + wconf.id,
		visible: false,
		position: {
	   		context: wconf.$element,
	        offset: "15 0",
			points: "lt rt"
	    }
	};
	
	var hide = function(){
		$('.helper' + wconf.id).remove();
		conf.visible = false;
		that.callbacks(conf, 'hide');
	};
	
	var show = function(text){
		conf.content = '<p><span class="ico error">Error: </span>' + text + '</p>';		
		that.show($.Event(), conf);
	};

	return { show: function(text){ show(text) }, hide: hide };
};

ui.init();
})(jQuery);