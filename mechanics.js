var mechanics_update_variable_name = false ;
var mechanics_update_timeout_id = false ;

function mechanics_update_variable( variable_name ) {
	mechanics_update_variable_name = variable_name ;
	clearTimeout( mechanics_update_timeout_id ) ;
	mechanics_update_timeout_id = setTimeout( function() {
		ajax_call( "command.php", ["command", "mechanics_update_variable",
			                       "variable_name", mechanics_update_variable_name,
			                       "variable_value", document.getElementById(variable_name).value], null ) ;
	}, 1000 ) ;
}


function iknowwhatimdoing() {
	hide( "iknowwhatimdoing" ) ;
	var elements_to_enable = document.getElementsByClassName( "iknowwhatimdoing" ) ;
	for( var i=0 ; i<elements_to_enable.length ; i++ ) {
		elements_to_enable[i].disabled = false ;
	}
}

var delay_updated_variable_timeout_id = false ;
function delay_updated_variable( id ) {
	clearTimeout( delay_updated_variable_timeout_id ) ;
	clearTimeout( get_status_timeout_id ) ;
	delay_updated_variable_timeout_id = setTimeout( function() {
		ajax_call( "command.php", ["command", id + "(" + document.getElementById(id).value + ")" ], null ) ;
		get_status_timeout_id = setTimeout( get_status, 2000 ) ;
	}, 1000 ) ;
}
