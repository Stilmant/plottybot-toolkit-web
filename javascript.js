var last_status = false ;
var gcode_to_pcode_value_update_timeout_id = false ;

function ajax_call( url, params, callback ) {

	var xmlhttp = new XMLHttpRequest() ;

	xmlhttp.onreadystatechange = function() {
		if( xmlhttp.readyState==XMLHttpRequest.DONE ) {
			if( xmlhttp.status==200 ) {
            	if( callback!=null ) {
                    callback( xmlhttp.responseText ) ;
                }
			}
		}
	} ;


	data = new FormData() ;
	for( var i=0 ; i<params.length ; i+=2 ) {
		data.append( params[i], params[i+1] ) ;
	}
	xmlhttp.open( "POST", url, true ) ;
    xmlhttp.send( data ) ;
}


function body_loaded() {

	// trick to make the top nav not cover the beginning of a section when navigating to it (#section_mechanics being the last one doesn't get this special treatment)
	window.addEventListener("hashchange", function () {
		if( window.location.hash!="#section_mechanics" ) {
		    window.scrollTo(window.scrollX, window.scrollY - 60 ) ;
	    }
	} ) ;

	var preview = document.getElementById( "preview" ) ;
	var size = Math.round( window.innerWidth / 2 ) ;
	preview.width = size ;
	preview.height = size ;
	preview.style.width = size + "px" ;
	preview.style.height = size + "px" ;
	canvas_max_x = size ;
	canvas_max_y = size ;
	get_status() ;
	handwriting_typewriter_loaded() ;
}



function calibrate_automatic() {
	calibration_done = false ;
	show( "section_draw_disabled" ) ;
	show( "section_mandalagaba_disabled" ) ;
	var elements_to_disable = document.getElementsByClassName( "needs_calibration" ) ;
	for( var i=0 ; i<elements_to_disable.length ; i++ ) {
		elements_to_disable[i].disabled = true ;
	}
	var elements_to_disable = document.getElementsByClassName( "needs_calibration_and_wifi" ) ;
	for( var i=0 ; i<elements_to_disable.length ; i++ ) {
		elements_to_disable[i].disabled = true ;
	}
	hide( "section_calibration_pen_adjustment" ) ;
	hide( "section_calibration_selection" ) ;
	show( "section_calibration_automatic" ) ;
	ajax_call( "command.php", ["command", "calibrate_automatic"], null ) ;
}


function calibrate_manually() {
	calibration_done = false ;
	show( "section_draw_disabled" ) ;
	show( "section_mandalagaba_disabled" ) ;
	var elements_to_disable = document.getElementsByClassName( "needs_calibration" ) ;
	for( var i=0 ; i<elements_to_disable.length ; i++ ) {
		elements_to_disable[i].disabled = true ;
	}
	var elements_to_disable = document.getElementsByClassName( "needs_calibration_and_wifi" ) ;
	for( var i=0 ; i<elements_to_disable.length ; i++ ) {
		elements_to_disable[i].disabled = true ;
	}
	show( "draw_actuation_disabled_overlay" ) ;
	hide( "section_calibration_pen_adjustment" ) ;
	hide( "section_calibration_selection" ) ;
	show( "section_calibration_manual" ) ;
	show( "calibrate_manually_fixate_down" ) ;
	hide( "calibrate_manually_fixate_up" ) ;
	hide( "calibrate_manually_fixate_left" ) ;
	hide( "calibrate_manually_fixate_right" ) ;
	document.getElementById( "section_calibration_manual_instructions" ).innerHTML = "Clicking on the arrows to move the head, go to the <strong>lower</strong> edge of the drawing area. It doesn't matter where the head is horizontally." ;
	ajax_call( "command.php", ["command", "calibrate_manually"], null ) ;
}

function calibrate_origin() {
	show("section_draw_disabled");
	show("section_mandalagaba_disabled");
	var elements_to_disable = document.getElementsByClassName("needs_calibration");
	for (var i = 0; i < elements_to_disable.length; i++) {
		elements_to_disable[i].disabled = true;
	}
	var elements_to_disable = document.getElementsByClassName("needs_calibration_and_wifi");
	for (var i = 0; i < elements_to_disable.length; i++) {
		elements_to_disable[i].disabled = true;
	}
	show("draw_actuation_disabled_overlay");
	hide("section_calibration_pen_adjustment");
	hide("section_calibration_selection");
	show("section_calibration_origin");
	document.getElementById("section_calibration_origin_instructions").innerHTML = "Move the head to the 0,0 position to reset that position.";
}

function calibrate_origin_step_down() {
	ajax_call("command.php", ["command", "calibrate_origin_step_down"], null);
	window.addEventListener("mouseup", calibrate_origin_step_stop);
}

function calibrate_origin_step_up() {
	ajax_call("command.php", ["command", "calibrate_origin_step_up"], null);
	window.addEventListener("mouseup", calibrate_origin_step_stop);
}

function calibrate_origin_step_left() {
	ajax_call("command.php", ["command", "calibrate_origin_step_left"], null);
	window.addEventListener("mouseup", calibrate_origin_step_stop);
}

function calibrate_origin_step_right() {
	ajax_call("command.php", ["command", "calibrate_origin_step_right"], null);
	window.addEventListener("mouseup", calibrate_origin_step_stop);
}

function calibrate_origin_step_stop() {
	ajax_call("command.php", ["command", "calibrate_origin_step_stop"], null);
	window.removeEventListener("mouseup", calibrate_origin_step_stop);
}

function calibrate_origin_fixate() {
	ajax_call("command.php", ["command", "calibrate_origin_fixate"], null);
	hide("section_calibration_origin");
	show("section_calibration_selection");
}

function draw() {
	if( ink_refill_conflict_check() ) {
		alert( "can't draw: conflict with ink refill routine" ) ;
	} else {
		if( last_status['draw_going'] &&
			last_status['pause_draw'] ) {
			// it's not a full draw, we're only interested in recovering from a pause
			play() ;
		} else {
			var tcode = document.getElementById( "tcode" ).value ;
			ajax_call( "command.php", ["command", "draw",
				                       "data", JSON.stringify(tcode)], null ) ;
		}
	}
}


var get_status_timeout_id ;
function get_status() {
	ajax_call( "command.php", ["command", "get_status"], interpret_status ) ;
	get_status_timeout_id = setTimeout( get_status, 2000 ) ;
}


function go_to( x, y ) {
	// var x = document.getElementById( "go_to_x" ).value ;
	// var y = document.getElementById( "go_to_y" ).value ;
	var data = {'x':x, 'y':y} ;
	ajax_call( "command.php", ["command", "go_to",
		                       "data", JSON.stringify(data)], function( result ) {
		if( result!="ok" ) {
			alert( result ) ;
		}
   } ) ;
}


function go_to_top_left_corner_clicked() {
	go_to( 10, canvas_max_y-10 ) ;
	hide( "go_to_top_left_corner" ) ;
	show( "go_to_top_right_corner" ) ;
	hide( "go_to_bottom_right_corner" ) ;
	hide( "go_to_bottom_left_corner" ) ;
}
function go_to_top_right_corner_clicked() {
	go_to( canvas_max_x-10, canvas_max_y-10 ) ;
	hide( "go_to_top_left_corner" ) ;
	hide( "go_to_top_right_corner" ) ;
	show( "go_to_bottom_right_corner" ) ;
	hide( "go_to_bottom_left_corner" ) ;

}
function go_to_bottom_right_corner_clicked() {
	go_to( canvas_max_x-10, 0 ) ;
	hide( "go_to_top_left_corner" ) ;
	hide( "go_to_top_right_corner" ) ;
	hide( "go_to_bottom_right_corner" ) ;
	show( "go_to_bottom_left_corner" ) ;

}
function go_to_bottom_left_corner_clicked() {
	go_to( 0, 0 ) ;
	show( "go_to_top_left_corner" ) ;
	hide( "go_to_top_right_corner" ) ;
	hide( "go_to_bottom_right_corner" ) ;
	hide( "go_to_bottom_left_corner" ) ;

}


var calibration_done = false ;
var canvas_max_x = false ;
var canvas_max_y = false ;
var preview_ratio = 1.0 ;
function interpret_status( status ) {
	status = JSON.parse( status ) ;

	last_status = status ;

	if( calibration_done===false && status['calibration_done']===true ) {
		// calibration complete!
		calibration_done = true ;

		hide( "section_draw_disabled" ) ;
		var elements_to_enable = document.getElementsByClassName( "needs_calibration" ) ;
		for( var i=0 ; i<elements_to_enable.length ; i++ ) {
			elements_to_enable[i].disabled = false ;
		}
		wifi_done = true ; //TODO let's do that proper
		if( wifi_done ) {
			hide( "section_mandalagaba_disabled" ) ;
			show( "section_mandalagaba_enabled" ) ;
			var elements_to_enable = document.getElementsByClassName( "needs_calibration_and_wifi" ) ;
			for( var i=0 ; i<elements_to_enable.length ; i++ ) {
				elements_to_enable[i].disabled = false ;
			}
		}

		show( "go_to_top_left_corner" ) ;
		hide( "go_to_top_right_corner" ) ;
		hide( "go_to_bottom_left_corner" ) ;
		hide( "go_to_bottom_right_corner" ) ;
		show( "section_calibration_pen_adjustment" ) ;
		hide( "section_calibration_automatic" ) ;
		hide( "section_calibration_manual" ) ;

		document.getElementById( "calibrate_manually" ).innerHTML = "Re-" + document.getElementById( "calibrate_manually" ).innerHTML ;
		document.getElementById( "calibrate_automatic" ).innerHTML = "Re-" + document.getElementById( "calibrate_automatic" ).innerHTML ;
		document.getElementById( "calibrate_origin" ).innerHTML = "Re-" + document.getElementById( "calibrate_origin" ).innerHTML ;
	}

	if( document.getElementById( 'default_step_sleep' ).value!=status['default_step_sleep'] ) {
		document.getElementById( 'default_step_sleep' ).value = status['default_step_sleep'] ;
	}
	if( document.getElementById( 'acceleration_fast_steps_sleep' ).value!=status['acceleration_fast_steps_sleep'] ) {
		document.getElementById( 'acceleration_fast_steps_sleep' ).value = status['acceleration_fast_steps_sleep'] ;
	}
	if( document.getElementById( 'acceleration_slow_steps_sleep' ).value!=status['acceleration_slow_steps_sleep'] ) {
		document.getElementById( 'acceleration_slow_steps_sleep' ).value = status['acceleration_slow_steps_sleep'] ;
	}
	if( document.getElementById( 'acceleration_steps' ).value!=status['acceleration_steps'] ) {
		document.getElementById( 'acceleration_steps' ).value = status['acceleration_steps'] ;
	}
	if( document.getElementById( 'deceleration_steps' ).value!=status['deceleration_steps'] ) {
		document.getElementById( 'deceleration_steps' ).value = status['deceleration_steps'] ;
	}
	if( document.getElementById( 'pen_down_action_time' ).value!=status['pen_down_action_time'] ) {
		document.getElementById( 'pen_down_action_time' ).value = status['pen_down_action_time'] ;
	}
	if( document.getElementById( 'pen_down_pulse_width' ).value!=status['pen_down_pulse_width'] ) {
		document.getElementById( 'pen_down_pulse_width' ).value = status['pen_down_pulse_width'] ;
	}
	if( document.getElementById( 'pen_down_sleep_before_move_time' ).value!=status['pen_down_sleep_before_move_time'] ) {
		document.getElementById( 'pen_down_sleep_before_move_time' ).value = status['pen_down_sleep_before_move_time'] ;
	}
	if( document.getElementById( 'pen_up_action_time' ).value!=status['pen_up_action_time'] ) {
		document.getElementById( 'pen_up_action_time' ).value = status['pen_up_action_time'] ;
	}
	if( document.getElementById( 'pen_up_pulse_width' ).value!=status['pen_up_pulse_width'] ) {
		document.getElementById( 'pen_up_pulse_width' ).value = status['pen_up_pulse_width'] ;
	}
	if( document.getElementById( 'pen_up_sleep_before_move_time' ).value!=status['pen_up_sleep_before_move_time'] ) {
		document.getElementById( 'pen_up_sleep_before_move_time' ).value = status['pen_up_sleep_before_move_time'] ;
	}

	if( status['canvas_max_x']>0 &&
		status['canvas_max_y']>0 &&
		(canvas_max_x!=status['canvas_max_x'] || canvas_max_y!=status['canvas_max_y']) ) {
		canvas_max_x = status['canvas_max_x'] ;
		canvas_max_y = status['canvas_max_y'] ;

		var max_preview_width = window.innerWidth * 8 / 10 ;
		var max_preview_height = window.innerHeight * 6 / 10 ;
		var preview_width = canvas_max_x ;
		var preview_height = canvas_max_y ;
		while( (preview_width*1.1)<=max_preview_width &&
			   (preview_height*1.1)<=max_preview_height ) {
			preview_width *= 1.1 ;
			preview_height *= 1.1 ;
			preview_ratio *= 1.1 ;
		}

		document.getElementById( 'preview' ).width = preview_width ;
		document.getElementById( 'preview' ).height = preview_height ;
		document.getElementById( 'preview' ).style.width = preview_width + "px" ;
		document.getElementById( 'preview' ).style.height = preview_height + "px" ;

		document.getElementById( "max_x" ).innerHTML = Math.floor( canvas_max_x ) ;
		document.getElementById( "max_y" ).innerHTML = Math.floor( canvas_max_y ) ;
	}

	if( status['ink_refill_routine_enabled']==true ) {
		document.getElementById( "ink_refill_routine_enabled" ).checked = true ;
		show( "ink_refill_routine_parameters" ) ;
		tcode_changed( 0, 1000000 ) ;
	} else {
		document.getElementById( "ink_refill_routine_enabled" ).checked = false ;
		hide( "ink_refill_routine_parameters" ) ;
	}
	if( status['ink_refill_every_penstroke']==true ) {
		document.getElementById( "ink_refill_every_penstroke" ).checked = true ;
	} else {
		document.getElementById( "ink_refill_every_penstroke" ).checked = false ;
	}
	document.getElementById( 'ink_refill_every_x' ).value = status['ink_refill_every_x'] ;
	if( ink_refill_routine_change_timeout_id===null ) {
		document.getElementById( 'ink_refill_routine' ).value = status['ink_refill_routine'] ;
	}

	if( status['ht_live_keyboard_on'] ) {
		document.getElementById( "handwriting_typewriter_live_keyboard" ).checked = true ;
	} else {
		document.getElementById( "handwriting_typewriter_live_keyboard" ).checked = false ;
	}

	if( status['limit_switch_bottom_on'] ) {
		document.getElementById( "limit_switch_bottom_on" ).classList.add( "badge-primary" ) ;
		document.getElementById( "limit_switch_bottom_on" ).classList.remove( "badge-light" ) ;
	} else {
		document.getElementById( "limit_switch_bottom_on" ).classList.add( "badge-light" ) ;
		document.getElementById( "limit_switch_bottom_on" ).classList.remove( "badge-primary" ) ;
	}
	if( status['limit_switch_top_on'] ) {
		document.getElementById( "limit_switch_top_on" ).classList.add( "badge-primary" ) ;
		document.getElementById( "limit_switch_top_on" ).classList.remove( "badge-light" ) ;
	} else {
		document.getElementById( "limit_switch_top_on" ).classList.add( "badge-light" ) ;
		document.getElementById( "limit_switch_top_on" ).classList.remove( "badge-primary" ) ;
	}
	if( status['limit_switch_left_on'] ) {
		document.getElementById( "limit_switch_left_on" ).classList.add( "badge-primary" ) ;
		document.getElementById( "limit_switch_left_on" ).classList.remove( "badge-light" ) ;
	} else {
		document.getElementById( "limit_switch_left_on" ).classList.add( "badge-light" ) ;
		document.getElementById( "limit_switch_left_on" ).classList.remove( "badge-primary" ) ;
	}
	if( status['limit_switch_right_on'] ) {
		document.getElementById( "limit_switch_right_on" ).classList.add( "badge-primary" ) ;
		document.getElementById( "limit_switch_right_on" ).classList.remove( "badge-light" ) ;
	} else {
		document.getElementById( "limit_switch_right_on" ).classList.add( "badge-light" ) ;
		document.getElementById( "limit_switch_right_on" ).classList.remove( "badge-primary" ) ;
	}

	if( status['mg_link_session_id']=="" ) {
		show( "mg_connect" ) ;
		hide( "mg_disconnect" ) ;
	} else {
		hide( "mg_connect" ) ;
		show( "mg_disconnect" ) ;
	}

	if( status['draw_going'] ) {
		if( status['pause_draw'] ) {
			disable( "pause_button" ) ;
			enable( "draw_button" ) ;
		} else {
			enable( "pause_button" ) ;
			disable( "draw_button" ) ;
		}
		enable( "stop_button" ) ;
	} else {
		if( status['calibration_done']===true ) {
			enable( "draw_button" ) ;
		} else {
			disable( "draw_button" ) ;
		}
		disable( "pause_button" ) ;
		disable( "stop_button" ) ;
	}

	if( 'error' in status && status['error']!="" ) {
		document.getElementById( "section_error_content" ).innerHTML = status['errors'] ;
		show( "section_error" ) ;
	} else {
		hide( "section_error" ) ;
	}
}


function done_adjusting_pen_height() {
	hide( "section_calibration_pen_adjustment" ) ;
	show( "section_calibration_selection" ) ;
}


function pause() {
	ajax_call( "command.php", ["command", "pause"], null ) ;
}


function play() {
	ajax_call( "command.php", ["command", "play"], null ) ;
}


function stop() {
	ajax_call( "command.php", ["command", "stop"], null ) ;
}


function pen_up() {
	ajax_call( "command.php", ["command", "pen_up"], null ) ;
}


function pen_down() {
	ajax_call( "command.php", ["command", "pen_down"], null ) ;
}


function calibrate_manually_step_down() {
	ajax_call( "command.php", ["command", "calibrate_manually_step_down"], null ) ;
	window.addEventListener( "mouseup", calibrate_manually_step_stop ) ;
}


function calibrate_manually_step_up() {
	ajax_call( "command.php", ["command", "calibrate_manually_step_up"], null ) ;
	window.addEventListener( "mouseup", calibrate_manually_step_stop ) ;
}


function calibrate_manually_step_left() {
	ajax_call( "command.php", ["command", "calibrate_manually_step_left"], null ) ;
	window.addEventListener( "mouseup", calibrate_manually_step_stop ) ;
}

function calibrate_manually_step_right() {
	ajax_call( "command.php", ["command", "calibrate_manually_step_right"], null ) ;
	window.addEventListener( "mouseup", calibrate_manually_step_stop ) ;
}


function calibrate_manually_step_stop() {
	ajax_call( "command.php", ["command", "calibrate_manually_step_stop"], null ) ;
	window.removeEventListener( "mouseup", calibrate_manually_step_stop ) ;
}


function calibrate_manually_fixate_down() {
	ajax_call( "command.php", ["command", "calibrate_manually_fixate_down"], null ) ;
	hide( "calibrate_manually_fixate_down" ) ;
	show( "calibrate_manually_fixate_up" ) ;
	hide( "calibrate_manually_fixate_left" ) ;
	hide( "calibrate_manually_fixate_right" ) ;
	document.getElementById( "section_calibration_manual_instructions" ).innerHTML = "Now go to the <strong>upper</strong> edge of the drawing area." ;
}


function calibrate_manually_fixate_up() {
	ajax_call( "command.php", ["command", "calibrate_manually_fixate_up"], null ) ;
	hide( "calibrate_manually_fixate_down" ) ;
	hide( "calibrate_manually_fixate_up" ) ;
	show( "calibrate_manually_fixate_left" ) ;
	hide( "calibrate_manually_fixate_right" ) ;
	document.getElementById( "section_calibration_manual_instructions" ).innerHTML = "Now go to the <strong>leftmost</strong> edge of the drawing area." ;
}


function calibrate_manually_fixate_left() {
	ajax_call( "command.php", ["command", "calibrate_manually_fixate_left"], null ) ;
	hide( "calibrate_manually_fixate_down" ) ;
	hide( "calibrate_manually_fixate_up" ) ;
	hide( "calibrate_manually_fixate_left" ) ;
	show( "calibrate_manually_fixate_right" ) ;
	document.getElementById( "section_calibration_manual_instructions" ).innerHTML = "Finally go to the <strong>rightmost</strong> edge of the drawing area." ;
}


function calibrate_manually_fixate_right() {
	// ajax_call( "command.php", ["command", "calibrate_manually_fixate_right"], function() {
	// 	get_status() ;
	// } ) ;
	hide( "calibrate_manually_fixate_down" ) ;
	hide( "calibrate_manually_fixate_up" ) ;
	hide( "calibrate_manually_fixate_left" ) ;
	hide( "calibrate_manually_fixate_right" ) ;
	hide( "section_calibration_manual_instructions" ) ;
	ajax_call( "command.php", ["command", "calibrate_manually_fixate_right"], null ) ;
}


function disable( selector ) {
    // compiling a list
    var all_elements = [] ;
    var element = document.getElementById( selector ) ;
    if( element!==null ) {
        all_elements.push( element ) ;
    }
    var elements = document.querySelectorAll( selector )
    for( var i=0 ; i<elements.length ; i++ ) {
        all_elements.push( elements[i] ) ;
    }

    // all right let's do it
    for( var i=0 ; i<all_elements.length ; i++ ) {
        all_elements[i].disabled = true ;
    }
}


function enable( selector ) {
    // compiling a list
    var all_elements = [] ;
    var element = document.getElementById( selector ) ;
    if( element!==null ) {
        all_elements.push( element ) ;
    }
    var elements = document.querySelectorAll( selector )
    for( var i=0 ; i<elements.length ; i++ ) {
        all_elements.push( elements[i] ) ;
    }

    // all right let's do it
    for( var i=0 ; i<all_elements.length ; i++ ) {
        all_elements[i].disabled = false ;
    }
}


function hide( selector ) {
    // compiling a list
    var all_elements = [] ;
    var element = document.getElementById( selector ) ;
    if( element!==null ) {
        all_elements.push( element ) ;
    }
    var elements = document.querySelectorAll( selector )
    for( var i=0 ; i<elements.length ; i++ ) {
        all_elements.push( elements[i] ) ;
    }

    // all right let's do it
    for( var i=0 ; i<all_elements.length ; i++ ) {
        all_elements[i].style.display = "none" ;
    }
}


function show( selector ) {
    // compiling a list
    var all_elements = [] ;
    var element = document.getElementById( selector ) ;
    if( element!==null ) {
        all_elements.push( element ) ;
    }
    var elements = document.querySelectorAll( selector ) ;
    for( var i=0 ; i<elements.length ; i++ ) {
        all_elements.push( elements[i] ) ;
    }

    // all right let's do it
    for( var i=0 ; i<all_elements.length ; i++ ) {
        if( all_elements[i].nodeName=="TR" || all_elements[i].nodeName=="BUTTON" ) {
            all_elements[i].style.display = "" ;
        } else {
            all_elements[i].style.display = "block" ;
        }
        // all_elements[i].style.display = "none" ;
    }
}


function connect_to_mg_session() {
	var session_id = document.getElementById("mg_session_id").value ;
	if( !validate_session_id(session_id) ) {
		alert( "invalid MG session ID" ) ;
		return false ;
	}
	ajax_call( "command.php", ["command", "connect_to_mg_session",
		                       "session_id", session_id], function() {
		//get_status() ; // TODO needed?
	} ) ;
}


function disconnect_from_mg_session() {
	ajax_call( "command.php", ["command", "disconnect_from_mg_session"], function() {
		//get_status() ; // TODO needed?
	} ) ;
}


function validate_session_id( session_id ) {
    if( session_id.match(/^[A-Za-z0-9\-\_]{1,32}$/) ) {
        return true ;
    }
    return false ;
}


ink_refill_routine_change_timeout_id = null ;
function ink_refill_routine_changed() {
	clearTimeout( ink_refill_routine_change_timeout_id ) ;
	ink_refill_routine_change_timeout_id = null ;
	ink_refill_routine_change_timeout_id = setTimeout( function() {
		var ink_refill_routine = document.getElementById( "ink_refill_routine" ).value ;
		ajax_call( "command.php", ["command", "update_ink_refill_routine",
			                       "data", JSON.stringify(ink_refill_routine)], function() {
			ink_refill_routine_change_timeout_id = null ;
        } ) ;
		tcode_changed( 0, 10000 ) ;
	}, 2000 ) ;
}


function test_ink_refill_routine() {
	var timeout = 0 ;
	if( ink_refill_routine_change_timeout_id!==null ) {
		timeout = 1100 ; // needs to be just a bit more than the timeout in ink_refill_routine_changed()
	}
	setTimeout( function() {
		ajax_call( "command.php", ["command", "test_ink_refill_routine"], function() {
			//get_status() ; // TODO needed?
		} ) ;
	}, timeout ) ;
}


function ink_refill_routine_enabled() {
	enabled = document.getElementById( "ink_refill_routine_enabled" ).checked ;
	if( enabled ) {
		show( "ink_refill_routine_parameters" ) ;
	} else {
		hide( "ink_refill_routine_parameters" ) ;
	}
	ajax_call( "command.php", ["command", "ink_refill_routine_enabled",
		                       "data", JSON.stringify(enabled)], function() {
				//get_status() ; // TODO needed?
				tcode_changed(0, 1000000) ;
	} ) ;
}

function ink_refill_every_penstroke() {
	enabled = document.getElementById( "ink_refill_every_penstroke" ).checked ;
	if( enabled ) {
		hide( "ink_refill_routine_parameters_refill_every_x" ) ;
	} else {
		show( "ink_refill_routine_parameters_refill_every_x" ) ;
	}
	ajax_call( "command.php", ["command", "ink_refill_every_penstroke",
		                       "data", JSON.stringify(enabled)], function() {
				//get_status() ; // TODO needed?
	} ) ;
}

function ink_refill_every_x() {
	value = document.getElementById( "ink_refill_every_x" ).value ;
	ajax_call( "command.php", ["command", "ink_refill_every_x",
		                       "data", JSON.stringify(value)], function() {
				//get_status() ; // TODO needed?
	} ) ;
}

function ink_refill_conflict_check() {
	var ink_refill_routine = document.getElementById( "ink_refill_routine" ).value ;
	var tcode = document.getElementById( "tcode" ).value ;

	if( !document.getElementById("ink_refill_routine_enabled").checked ) {
		// it's not even enabled so we're good
		return false ;
	}

	var ink_refill_routine_lowest_x = false ;
	var ink_refill_routine_highest_x = false ;
	var ink_refill_routine_lowest_y = false ;
	var ink_refill_routine_highest_y = false ;
	var tcode_lowest_x = false ;
	var tcode_highest_x = false ;
	var tcode_lowest_y = false ;
	var tcode_highest_y = false ;

	ink_refill_routine = ink_refill_routine.split( "\n" ) ;
	for( var i=0 ; i<ink_refill_routine.length ; i++ ) {
		var line = ink_refill_routine[i] ;
		if( /^\s*go_to\(\s*[0-9]+\s*,\s*[0-9]+\s*\)\s*$/.test(line) ) {
			var x = line.split( "(" )[1].split( "," )[0].trim() ;
			var y = line.split( "(" )[1].split( "," )[1].replace( ")", "" ).trim() ;
			if( x<ink_refill_routine_lowest_x || ink_refill_routine_lowest_x===false  ) {
				ink_refill_routine_lowest_x = x ;
			}
			if( x>ink_refill_routine_highest_x || ink_refill_routine_highest_x===false ) {
				ink_refill_routine_highest_x = x ;
			}
			if( y<ink_refill_routine_lowest_y || ink_refill_routine_lowest_y===false ) {
				ink_refill_routine_lowest_y = y ;
			}
			if( y>ink_refill_routine_highest_y || ink_refill_routine_highest_y===false ) {
				ink_refill_routine_highest_y = y ;
			}
		}
	}

	tcode = tcode.split( "\n" ) ;
	for( var i=0 ; i<tcode.length ; i++ ) {
		var line = tcode[i] ;
		if( /^\s*go_to\(\s*[0-9]+\s*,\s*[0-9]+\s*\)\s*$/.test(line) ) {
			var x = line.split( "(" )[1].split( "," )[0].trim() ;
			var y = line.split( "(" )[1].split( "," )[1].replace( ")", "" ).trim() ;
			if( x<tcode_lowest_x || tcode_lowest_x===false ) {
				tcode_lowest_x = x ;
			}
			if( x>tcode_highest_x || tcode_highest_x===false ) {
				tcode_highest_x = x ;
			}
			if( y<tcode_lowest_y || tcode_lowest_y===false ) {
				tcode_lowest_y = y ;
			}
			if( y>tcode_highest_y || tcode_highest_y===false ) {
				tcode_highest_y = y ;
			}
		}
	}


	// ok! box collision time
	if( (ink_refill_routine_lowest_x>=tcode_lowest_x && ink_refill_routine_lowest_x<=tcode_highest_x) ||
		(ink_refill_routine_lowest_y>=tcode_lowest_y && ink_refill_routine_lowest_y<=tcode_highest_y) ||
		(ink_refill_routine_highest_x>=tcode_lowest_x && ink_refill_routine_highest_x<=tcode_highest_x) ||
		(ink_refill_routine_highest_y>=tcode_lowest_y && ink_refill_routine_highest_y<=tcode_highest_y) ) {
		return true ;
	}
	return false ;
}


function tcode_changed( time_to_draw, x_strokes_at_a_time ) {

	var ink_refill_pcode = "" ;
	if( document.getElementById( "ink_refill_routine_enabled" ).checked===true ) {
		ink_refill_pcode = document.getElementById( "ink_refill_routine" ).value ;
		ink_refill_pcode = "pen_up()\ncolor(#F6828C)\n" + ink_refill_pcode + "\npen_up()\n" ;
	}
	draw_turtle_code( document.getElementById( 'tcode' ).value + ink_refill_pcode, document.getElementById('preview'), time_to_draw, x_strokes_at_a_time ) ;
}


function gcode_changed() {
	if( document.getElementById('aggregation_algorithm').value=="polarized" ) {
		show( "aggregation_algorithm_polarized_pole_coordinates" ) ;
	} else {
		hide( "aggregation_algorithm_polarized_pole_coordinates" ) ;
	}
	document.getElementById( 'tcode' ).value = gcode_to_turtle( document.getElementById('gcode').value,
		                                                        document.getElementById('aggregation_algorithm_normalize').checked,
		                                                        document.getElementById('aggregation_algorithm').value,
		                                                        {x:parseInt(document.getElementById('aggregation_algorithm_polarized_x').value), y:parseInt(document.getElementById('aggregation_algorithm_polarized_y').value)},
		                                                        document.getElementById('skip_pen_jumps_shorter_than_value').value ) ;
	tcode_changed( 10, 10 ) ;
}


function mechanics_reset_to_defaults() {
	ajax_call( "command.php", ["command", "reset_to_defaults"], null ) ;
}


function test_bottom_stepper() {
	ajax_call( "command.php", ["command", "test_bottom_stepper"], null ) ;
}


function test_top_stepper() {
	ajax_call( "command.php", ["command", "test_top_stepper"], null ) ;
}
