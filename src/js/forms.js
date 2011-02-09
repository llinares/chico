/**
 *	Form Controller
 *	@author
 *	@Contructor
 *	@return An interface object
 */

/*

conf:{
	[ messages ]: message map for each validation type,
	[ callbacks ]: {
		[ submit ]: function,
		[ clear ]: function
	},
}
*/

ui.forms = function(conf){
    
	// Validation
	// Are there action and submit type?
	if ($(conf.element).find(":submit").length == 0 || $(conf.element).attr('action') == "" ){ 
		 alert("Forms fatal error: The <input type=submit> is missing, or need to define a action attribute on the form tag.");
		 return;
	};
	
	if (ui.instances.forms) {
		if(ui.instances.forms.length > 0){ // Is there forms in map instances?
			for(var i = 0, j = ui.instances.forms.length; i < j; i ++){
				if(ui.instances.forms[i].element === conf.element){
					return { 
		                exists: true, 
		                object: ui.instances.forms[i]
		            };
				};
			};
		};
	}
	
	// Start new forms
	var that = ui.controllers(); // Inheritance
	var status = false;

	// patch exists because the components need a trigger
	$(conf.element).bind('submit', function(event){ that.prevent(event); });
	$(conf.element).find(":submit").unbind('click'); // Delete all click handlers asociated to submit button >NATAN: Why?

	// Create the Messages for General Error
	if (!conf.messages) conf.messages = {};
	
	conf.messages["general"] = conf.messages["general"] || "Check for errors.";	


	// General Error
	var $error = $('<p class="ch-validator"><span class="ico error">Error: </span>' + conf.messages["general"] + '</p>');	
	var createError = function(){ // Create
		$(conf.element).before( $error );		
		$("body").trigger(ui.events.CHANGE_LAYOUT);

	};
	var removeError = function(){ // Remove
		$error.detach();
		$("body").trigger(ui.events.CHANGE_LAYOUT);
	};
	
	// Publics Methods
	var checkStatus = function(){
		// Check status of my childrens
		for(var i = 0, j = that.children.length; i < j; i ++){
			// Status error (cut the flow)
			if( !that.children[i].status ){				
				if (!status) removeError();				
				createError();
				status = false;
				return;
			};
		};
		
		// Status OK (with previous error)
		if (!status) {
			removeError();
			status = true;
		};
	};
	
	var validate = function(event){
    
        that.callbacks(conf, 'beforeValidate');
        
		that.prevent(event);
		
		// Shoot validations
		for(var i = 0, j = that.children.length; i < j; i ++){
			that.children[i].validate();
		};
		
		checkStatus();

        that.callbacks(conf, 'afterValidate');
        
		return conf.publish; // Return publish object
	};

	var submit = function(event){

        that.callbacks(conf, 'beforeSubmit');

		that.prevent(event);

		validate(event); // Validate start
		
		if ( status ){ // Status OK
			if ( !conf.hasOwnProperty("onSubmit") ) {
				conf.element.submit();
			}else{
				that.callbacks(conf, "onSubmit");
			};
		};		

        that.callbacks(conf, 'afterSubmit');
        
		return conf.publish; // Return publish object
	};


	var clear = function(event){		
		that.prevent(event);		
		conf.element.reset(); // Reset html form
		removeError();	
		for(var i = 0, j = that.children.length; i < j; i ++) that.children[i].reset(); // Reset helpers		
		return conf.publish; // Return publish object
	};



	// Bind the submit
	$(conf.element).bind('submit', function(event){
		that.prevent(event);
		submit(event);
	});
	
	// Bind the reset
	$(conf.element).find(":reset, .resetForm").bind('click', clear);
	
    // Create the publish object to be returned
	conf.publish = that.publish;
	
	/**
	 *  @ Public Properties
	 */
	conf.publish.uid = conf.uid;
	conf.publish.element = conf.element;
	conf.publish.type = conf.type;
	conf.publish.status = status;
	conf.publish.children = that.children;
	
	/**
	 *  @ Public Methods
	 */
	conf.publish.validate = validate;
	conf.publish.submit = submit;
	conf.publish.checkStatus = checkStatus;
	conf.publish.clear = clear;
	conf.publish.messages = conf.messages;
	
	return conf.publish;
};
