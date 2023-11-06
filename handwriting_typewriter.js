// config variables
var writing_frame_color = "#61c2ff"
var writing_frame_thickness = 1 ;
var writing_color = "#000000" ;
var writing_thickness = 2 ;
var work_canvas_size = 256 ;
var char_variation_canvas_size = 64 ;
// don't touch anything bellow

var work_canvas ;
var work_canvas_context ;
var mouse_down_events ;
var mouse_up_events ;
var mouse_move_events ;
var touch_supported ;
var last_mouse_cords ;
var last_mouse_extra_specs ;
var work_dots ;
var work_strokes ;
var work_start_line ;
var work_end_line ;
var work_start_dot ;
var work_end_dot ;
var ffont ;
var char_being_edited ;
var variation_index_being_edited ;
var work_to_variation_scale ;
var first_start_line_adjust ;
var first_end_line_adjust ;
var place_start_dot ;
var place_end_dot ;

var seeded_random_number_generator = null ;

function handwriting_typewriter_loaded() {
	work_canvas = document.getElementById( "work_canvas" ) ;
	work_canvas_context = work_canvas.getContext( "2d" ) ;

	work_canvas_context.work_strokestyle = "#000000" ;
	work_canvas_context.fillStyle = "#000000" ;
	work_canvas_context.lineWidth = 3 ;
	work_canvas_context.lineJoin = "round" ;
	work_canvas_context.lineCap = "round" ;
	document.getElementById( "work_canvas" ).width = work_canvas_size ;
    document.getElementById( "work_canvas" ).height = work_canvas_size * 8 / 6 ;
    document.getElementById( "work_canvas" ).style.width = work_canvas_size + "px" ;
    document.getElementById( "work_canvas" ).style.height = (work_canvas_size * 8 / 6) + "px" ;

    last_mouse_cords = { x:0, y:0 } ;
    last_mouse_extra_specs = false ;
	work_dots = [] ;
	work_strokes = [] ;
	work_start_line = 0 ;
	work_end_line = 0 ;
	work_start_dot = { x:-1, y:-1 } ;
	work_end_dot = { x:-1, y:-1 } ;
	ffont = {} ;
	char_being_edited = false ;
	variation_index_being_edited = false ;
	work_to_variation_scale = char_variation_canvas_size / work_canvas_size ;
	first_start_line_adjust = true ;
	first_end_line_adjust = true ;
	first_place_start_dot = true ;
	first_place_end_dot = true ;
	place_start_dot = false ;
	place_end_dot = false ;

	mouse_down_events = [] ;
    mouse_move_events = [] ;
    mouse_up_events = [] ;
    touch_supported = "ontouchstart" in document.documentElement
    if( touch_supported ) {
        mouse_down_events.push( "touchstart" ) ;
        mouse_move_events.push( "touchmove" ) ;
        mouse_up_events.push( "touchend" ) ;
        mouse_up_events.push( "touchcancel" ) ;
    }
    mouse_down_events.push( "mousedown" ) ;
    mouse_move_events.push( "mousemove" ) ;
    mouse_up_events.push( "mouseup" ) ;

	for( var i=0 ; i<mouse_down_events.length ; i++ ) {
        work_canvas.addEventListener( mouse_down_events[i], on_canvas_mouse_down ) ;
    }

    build_char_variation_table() ;
    add_char_variation( char_to_unicode(document.getElementById("character_list").value[0]) ) ;
    select_char_to_be_edited( char_to_unicode(document.getElementById("character_list").value[0]), 0 ) ;


    // taken from https://stackoverflow.com/a/14155586
    document.forms['myform'].elements['myfile'].onchange = function(evt) {
    if(!window.FileReader) return; // Browser is not compatible
	    var reader = new FileReader();
	    reader.onload = function(evt) {
	        if(evt.target.readyState != 2) return;
	        if(evt.target.error) {
	            alert('Error while reading file');
	            return;
	        }
	        ffont = JSON.parse( evt.target.result ) ;
	        char_being_edited = false ;
	        build_char_variation_table() ;
			select_char_to_be_edited( Object.keys(ffont)[0], ffont[Object.keys(ffont)[0]].length-1 ) ;
			text_changed() ;
	        // filecontent = evt.target.result;
	       // document.forms['myform'].elements['text'].value = evt.target.result;
	    };
	    reader.readAsText(evt.target.files[0]);
	};
}


function generate_random_integer_between_min_and_max( min, max ) {
	if( seeded_random_number_generator===null ) {
	    seeded_random_number_generator = new Math.seedrandom() ;
	}
	return Math.floor( seeded_random_number_generator()*(max-min+1)+min ) ;
}


function build_char_variation_table() {
	var character_list = document.getElementById( "character_list" ).value ;
	var new_html = "Character Table:<br/>" ;
	new_html += "<table style=\"table-layout:fixed;word-wrap:break-word;\" cellpadding=\"5\" cellspacing=\"5\">" ;
	new_html += "<tr>" ;
	for( var i=0 ; i<character_list.length ; i++ ) {
		selected_style = "" ;
		if( char_being_edited==char_to_unicode(character_list[i]) ) {
			selected_style = "style=\"background-color:#f3f3f3;\"" ;
		}
		new_html += "<td " + selected_style + " align=\"center\" style=\"min-width:" + char_variation_canvas_size + "px;max-width:" + char_variation_canvas_size + "px;width:" + char_variation_canvas_size + "px;\">" + character_list[i] + " / " + char_to_unicode(character_list[i]) + "</td>" ;
	}
	new_html += "</tr>" ;

	var variation_index = 0 ;
	while( true ) {
		new_html += "<tr>" ;
		var got_no_char = true ;
		for( var i=0 ; i<character_list.length ; i++ ) {
			if( (char_to_unicode(character_list[i]) in ffont) &&
				variation_index<ffont[char_to_unicode(character_list[i])].length ) {
				got_no_char = false ;
				selected_style = "" ;
				if( char_being_edited==char_to_unicode(character_list[i]) &&
					variation_index_being_edited==variation_index ) {
					selected_style = "style=\"background-color:#f3f3f3;\"" ;
				}
				new_html += "<td " + selected_style + " onClick=\"select_char_to_be_edited('"+char_to_unicode(character_list[i])+"', "+variation_index+");\"><canvas class=\"char_variation\" id=\"char_variation_canvas_" + char_to_unicode(character_list[i]) + "_" + variation_index + "\" width=\"" + char_variation_canvas_size + "\" height=\"" + (char_variation_canvas_size*8/6) + "\" style=\"width:" + char_variation_canvas_size + "px; height:" + (char_variation_canvas_size*8/6) + "px;\"></canvas></td>" ;
			} else if( ((char_to_unicode(character_list[i]) in ffont) &&
			           (variation_index==ffont[char_to_unicode(character_list[i])].length)) ||
			           (!(char_to_unicode(character_list[i]) in ffont) &&
			           variation_index==0) ) {
				new_html += "<td align=\"center\" onClick=\"add_char_variation('"+char_to_unicode(character_list[i])+"');\">+</td>" ;
			} else {
				new_html += "<td></td>" ;
			}
		}
		new_html += "</tr>" ;
		variation_index++ ;
		if( got_no_char ) {
			break ;
		}
	}

	new_html += "</table>" ;
	document.getElementById( "char_variation_table" ).innerHTML = new_html ;

	char_variation_canvasses = document.getElementsByClassName( "char_variation" ) ;
	for( var i=0 ; i<char_variation_canvasses.length ; i++ ) {
		//console.log( char_variation_canvasses[i] ) ;
		render_writing_frame( char_variation_canvasses[i], work_to_variation_scale ) ;
	}

	var variation_index = 0 ;
	while( true ) {
		new_html += "<tr>" ;
		var got_no_char = true ;
		for( var i=0 ; i<character_list.length ; i++ ) {
			if( (char_to_unicode(character_list[i]) in ffont) &&
				variation_index<ffont[char_to_unicode(character_list[i])].length ) {
				for( var j=0 ; j<ffont[char_to_unicode(character_list[i])][variation_index].strokes.length ; j++ ) {
		    		draw_quadratic_curve( ffont[char_to_unicode(character_list[i])][variation_index].strokes[j], writing_color, writing_thickness, document.getElementById("char_variation_canvas_" + char_to_unicode(character_list[i]) + "_" + variation_index).getContext("2d"), work_to_variation_scale ) ;
			    }
			    render_start_and_end_lines( document.getElementById("char_variation_canvas_" + char_to_unicode(character_list[i]) + "_" + variation_index), ffont[char_to_unicode(character_list[i])][variation_index].start_line, ffont[char_to_unicode(character_list[i])][variation_index].end_line, work_to_variation_scale ) ;
			    render_start_and_end_dots( document.getElementById("char_variation_canvas_" + char_to_unicode(character_list[i]) + "_" + variation_index), ffont[char_to_unicode(character_list[i])][variation_index].start_dot, ffont[char_to_unicode(character_list[i])][variation_index].end_dot, work_to_variation_scale ) ;
				got_no_char = false ;
			}
		}

		variation_index++ ;
		if( got_no_char ) {
			break ;
		}
	}

	// var shift_by = document.getElementsByClassName( "use_me_as_a_reference_to_shift" )[0].getBoundingClientRect().height ;
	// var elements_to_shift = document.getElementsByClassName( "shift_me_vertically" ) ;
	// for( var k=0 ; k<elements_to_shift.length ; k++ ) {
	// 	var element = elements_to_shift[k] ;
	// 	element.style.top = "-" + (element.dataset.index*shift_by) + "px" ;
	// 	//console.log(
	// }

	// for( var i=0 ; i<characters.length ; i++ ) {
	// 	other_canvasses = document.getElementsByClassName( "canvas_"+char_to_unicode(characters[i]) ) ;
	// 	for( var j=0 ; j<other_canvasses.length ; j++ ) {
	// 		render_writing_frame( other_canvasses[j], other_canvasses[j].getContext( "2d" ) ) ;
	// 	}
	// }
}


function add_char_variation( unicode ) {
	if( !(unicode in ffont) ) {
		ffont[unicode] = [] ;
	}
	ffont[unicode].push( {strokes:[],
		                  start_line:0,
		                  end_line:0,
		                  start_dot:{x:-1,y:-1},
		              	  end_dot:{x:-1,y:-1}} ) ;
	build_char_variation_table() ;
	select_char_to_be_edited( unicode, ffont[unicode].length-1 ) ;
}


function select_char_to_be_edited( unicode, variation_index ) {
	work_canvas_context.clearRect( 0, 0, work_canvas.width, work_canvas.height ) ;
	render_writing_frame( work_canvas ) ;

	if( char_being_edited!==false ) {
		ffont[char_being_edited][variation_index_being_edited].strokes    = work_strokes ;
		ffont[char_being_edited][variation_index_being_edited].start_line = work_start_line ;
		ffont[char_being_edited][variation_index_being_edited].end_line   = work_end_line ;
		ffont[char_being_edited][variation_index_being_edited].start_dot  = work_start_dot ;
		ffont[char_being_edited][variation_index_being_edited].end_dot    = work_end_dot ;
	}
	if( (unicode in ffont) &&
		(variation_index in ffont[unicode]) ) {
		work_strokes    = ffont[unicode][variation_index].strokes ;
		work_start_line = ffont[unicode][variation_index].start_line ;
		work_end_line   = ffont[unicode][variation_index].end_line ;
		work_start_dot  = ffont[unicode][variation_index].start_dot ;
		work_end_dot    = ffont[unicode][variation_index].end_dot ;
	} else {
		work_strokes    = [] ;
		work_start_line = 0 ;
		work_end_line   = 0 ;
		work_start_dot  = { x:-1, y:-1 } ;
		work_end_dot    = { x:-1, y:-1 } ;
	}
	work_dots = [] ;
	last_mouse_cords = { x:0, y:0 } ;
	last_mouse_extra_specs = false ;
	first_start_line_adjust = true ;
	first_end_line_adjust = true ;
	first_place_start_dot = true ;
	first_place_end_dot = true ;

	for( var i=0 ; i<work_strokes.length ; i++ ) {
    	draw_quadratic_curve( work_strokes[i], writing_color, writing_thickness, work_canvas_context ) ;
		//draw_quadratic_curve( work_strokes[i], writing_color, writing_thickness, char_variation_canvas_context, work_to_variation_scale ) ;
    }

	char_being_edited = unicode ;
	variation_index_being_edited = variation_index ;
	build_char_variation_table() ;

	render_start_and_end_lines( work_canvas, work_start_line, work_end_line ) ;
	render_start_and_end_dots( work_canvas, work_start_dot, work_end_dot ) ;

	place_end_dot = false ;
	place_start_dot = false ;
}


function on_canvas_mouse_down( event ) {
    event.preventDefault() ;

    for( var i=0 ; i<mouse_move_events.length ; i++ ) {
    	window.addEventListener( mouse_move_events[i], on_canvas_mouse_move ) ;
    }
    for( var i=0 ; i<mouse_up_events.length ; i++ ) {
    	window.addEventListener( mouse_up_events[i], on_canvas_mouse_up ) ;
    }

    //update_mouse_position( event ) ;
    update_canvas_by_quadratic_curve( event ) ;
}


function update_mouse_position( event ) {
    var target ;
    if( touch_supported ) {
    	if( event.touches.length==0 ) {
    		return false ;
    	}
        target = event.touches[0] ;
        last_mouse_extra_specs = {} ;
        if( 'altitudeAngle' in target ) {
        	last_mouse_extra_specs.altitudeAngle = target.altitudeAngle ;
        }
        if( 'azimutAngle' in target ) {
        	last_mouse_extra_specs.azimutAngle = target.azimutAngle ;
        }
        if( 'force' in target ) {
        	last_mouse_extra_specs.force = target.force ;
        }
    } else {
        target = event ;
    }

    last_mouse_cords.x = target.pageX - work_canvas.getBoundingClientRect().left - window.scrollX ;
    last_mouse_cords.y = target.pageY - work_canvas.getBoundingClientRect().top - window.scrollY ;

    var coordinates = { x:last_mouse_cords.x, y:last_mouse_cords.y, extra_specs:last_mouse_extra_specs } ;

    if( !(place_start_dot || place_end_dot) ) {
	    if( work_dots.length<1 || work_dots[work_dots.length-1].x!=coordinates.x || work_dots[work_dots.length-1].y!=coordinates.y ) {
	        work_dots.push( coordinates ) ;
	    }
	}
}


function render_start_and_end_lines( canvas, start_line, end_line, scale ) {
	scale = typeof scale !== 'undefined' ? scale : 1.0 ;

	var canvas_context = canvas.getContext( "2d" ) ;
	canvas_context.strokeStyle = "green" ;
    canvas_context.fillStyle = "green" ;
    canvas_context.lineJoin = "round" ;
    canvas_context.lineCap = "round" ;
    canvas_context.lineWidth = 1 * scale ;
    canvas_context.setLineDash( [4*scale, 8*scale] ) ;
	canvas_context.beginPath() ;
    canvas_context.moveTo( start_line*scale, 0 ) ;
    canvas_context.lineTo( start_line*scale, canvas.height ) ;
    canvas_context.stroke() ;

    canvas_context.strokeStyle = "red" ;
    canvas_context.fillStyle = "red" ;
    canvas_context.beginPath() ;
    canvas_context.moveTo( canvas.width-end_line*scale, 0 ) ;
    canvas_context.lineTo( canvas.width-end_line*scale, canvas.height ) ;
    canvas_context.stroke() ;

    canvas_context.setLineDash( [] ) ;
}


function render_start_and_end_dots( canvas, start_dot, end_dot, scale ) {
	scale = typeof scale !== 'undefined' ? scale : 1.0 ;

	if( start_dot.x!=-1 && start_dot.y!=-1 ) {
		var canvas_context = canvas.getContext( "2d" ) ;
		canvas_context.strokeStyle = "green" ;
	    canvas_context.fillStyle = "green" ;
	    canvas_context.lineJoin = "round" ;
	    canvas_context.lineCap = "round" ;
	    canvas_context.lineWidth = 1 * scale ;
		canvas_context.beginPath() ;
	    canvas_context.moveTo( start_dot.x*scale-5*scale, start_dot.y*scale-5*scale ) ;
	    canvas_context.lineTo( start_dot.x*scale+5*scale, start_dot.y*scale+5*scale ) ;
	    canvas_context.stroke() ;
	    canvas_context.beginPath() ;
	    canvas_context.moveTo( start_dot.x*scale-5*scale, start_dot.y*scale+5*scale ) ;
	    canvas_context.lineTo( start_dot.x*scale+5*scale, start_dot.y*scale-5*scale ) ;
	    canvas_context.stroke() ;
	}

 	if( end_dot.x!=-1 && end_dot.y!=-1 ) {
		var canvas_context = canvas.getContext( "2d" ) ;
		canvas_context.strokeStyle = "red" ;
	    canvas_context.fillStyle = "red" ;
	    canvas_context.lineJoin = "round" ;
	    canvas_context.lineCap = "round" ;
	    canvas_context.lineWidth = 1 * scale ;
		canvas_context.beginPath() ;
	    canvas_context.moveTo( end_dot.x*scale-5, end_dot.y*scale-5 ) ;
	    canvas_context.lineTo( end_dot.x*scale+5, end_dot.y*scale+5 ) ;
	    canvas_context.stroke() ;
	    canvas_context.beginPath() ;
	    canvas_context.moveTo( end_dot.x*scale-5, end_dot.y*scale+5 ) ;
	    canvas_context.lineTo( end_dot.x*scale+5, end_dot.y*scale-5 ) ;
	    canvas_context.stroke() ;
	}
}


function render_writing_frame( canvas, scale ) {
	scale = typeof scale !== 'undefined' ? scale : 1.0 ;

	var context = canvas.getContext( "2d" ) ;
	context.strokeStyle = writing_frame_color ;
    context.fillStyle = writing_frame_color ;
    context.lineJoin = "round" ;
    context.lineCap = "round" ;
    context.lineWidth = writing_frame_thickness * scale ;

    for( var i=0 ; i<=6 ; i++ ) {
		if( i==0 || i==4 || i==8 ) {
			context.lineWidth = writing_frame_thickness * scale * 2 ;
		} else {
			context.lineWidth = writing_frame_thickness * scale ;
		}
	    context.beginPath() ;
	    context.moveTo( 0, i*canvas.height/6 ) ;
	    context.lineTo( canvas.width, i*canvas.height/6 ) ;
	    context.stroke() ;
	}

	// if( el_local_canvas==canvas ) {
	// 	context.beginPath() ;
	//     context.moveTo( 0, 0 ) ;
	//     context.lineTo( 0, el_local_canvas.height ) ;
	//     context.stroke() ;

	//     context.beginPath() ;
	//     context.moveTo( el_local_canvas.width, 0 ) ;
	//     context.lineTo( el_local_canvas.width, el_local_canvas.height ) ;
	//     context.stroke() ;
	// }
}


function update_canvas_by_quadratic_curve( event ) {
    update_mouse_position( event ) ;

    // var other_canvasses = document.getElementsByClassName( "canvas_" + char_being_edited ) ;
    // var other_contexts = [] ;
    // for( var i=0 ; i<other_canvasses.length ; i++ ) {
    // 	other_contexts.push( other_canvasses[i].getContext( "2d" ) ) ;
    // }

    // work canvas is always cleared up before drawing.
    work_canvas_context.clearRect( 0, 0, work_canvas.width, work_canvas.height ) ;
    render_writing_frame( work_canvas ) ;

    char_variation_canvas = document.getElementById( "char_variation_canvas_" + char_being_edited + "_" + variation_index_being_edited ) ;
    char_variation_canvas_context = char_variation_canvas.getContext( "2d" ) ;
    char_variation_canvas_context.clearRect( 0, 0, char_variation_canvas.width, char_variation_canvas.height ) ;
    render_writing_frame( char_variation_canvas, work_to_variation_scale ) ;

    // previous penwork_strokes
    for( var i=0 ; i<work_strokes.length ; i++ ) {
    	draw_quadratic_curve( work_strokes[i], writing_color, writing_thickness, work_canvas_context ) ;
		draw_quadratic_curve( work_strokes[i], writing_color, writing_thickness, char_variation_canvas_context, work_to_variation_scale ) ;
    }

    // current penstroke
    draw_quadratic_curve( work_dots, writing_color, writing_thickness, work_canvas_context ) ;
    draw_quadratic_curve( work_dots, writing_color, writing_thickness, char_variation_canvas_context, work_to_variation_scale ) ;

    if( place_start_dot ) {
    	work_start_dot = {x:last_mouse_cords.x, y:last_mouse_cords.y} ;

    	// snap to closest that's isn't the first dot of a stroke
    	var closest_distance = false ;
    	var closest = {x:-1, y:-1};
    	for( var i=0 ; i<work_strokes.length ; i++ ) {
    		for( var j=1 ; j<work_strokes[i].length ; j++ ) {
    			var distance = Math.sqrt( (work_strokes[i][j].x-work_start_dot.x)*(work_strokes[i][j].x-work_start_dot.x) + (work_strokes[i][j].y-work_start_dot.y)*(work_strokes[i][j].y-work_start_dot.y) ) ;
    			if( closest_distance===false ||
    				distance<closest_distance ) {
    				closest = work_strokes[i][j] ;
    				closest_distance = distance ;
    			}
    		}
    	}
    	work_start_dot = closest ;
    } else if( place_end_dot ) {
    	work_end_dot = {x:last_mouse_cords.x, y:last_mouse_cords.y} ;

    	// snap to closest that isn't the end of a stroke
    	var closest_distance = false ;
    	var closest = {x:-1, y:-1};
    	for( var i=0 ; i<work_strokes.length ; i++ ) {
    		for( var j=0 ; j<(work_strokes[i].length-1) ; j++ ) {
    			var distance = Math.sqrt( (work_strokes[i][j].x-work_end_dot.x)*(work_strokes[i][j].x-work_end_dot.x) + (work_strokes[i][j].y-work_end_dot.y)*(work_strokes[i][j].y-work_end_dot.y) ) ;
    			if( closest_distance===false ||
    				distance<closest_distance ) {
    				closest = work_strokes[i][j] ;
    				closest_distance = distance ;
    			}
    		}
    	}
    	work_end_dot = closest ;
    }

    render_start_and_end_lines( work_canvas, work_start_line, work_end_line ) ;
    render_start_and_end_dots( work_canvas, work_start_dot, work_end_dot ) ;
    render_start_and_end_lines( char_variation_canvas, work_start_line, work_end_line, work_to_variation_scale ) ;
    render_start_and_end_dots( char_variation_canvas, work_start_dot, work_end_dot, work_to_variation_scale ) ;
}


function on_canvas_mouse_move( event ) {
    event.preventDefault() ;

    update_canvas_by_quadratic_curve( event ) ;
}


function on_canvas_mouse_up( event ) {
    event.preventDefault() ;
    update_canvas_by_quadratic_curve( event ) ;

    for( var i=0 ; i<mouse_move_events.length ; i++ ) {
    	window.removeEventListener( mouse_move_events[i], on_canvas_mouse_move ) ;
    }
    for( var i=0 ; i<mouse_up_events.length ; i++ ) {
    	window.removeEventListener( mouse_up_events[i], on_canvas_mouse_up ) ;
    }

    if( !place_start_dot && !place_end_dot && work_dots.length>0 ) {
    	work_strokes.push( work_dots ) ;
    }
    work_dots = [] ;
}


function draw_quadratic_curve( work_dots, color, thickness, target, scale ) {
	scale = typeof scale !== 'undefined' ? scale : 1.0 ;

    target.strokeStyle = color ;
    target.fillStyle = color ;
    target.lineWidth = thickness*scale ;
    target.lineJoin = "round" ;
    target.lineCap = "round" ;

    if( work_dots.length>0 ) { // just in case
    	new_work_dots = [] ;
		for( var i=0 ; i<work_dots.length ; i++ ) {
			if( scale!=1.0 ) {
    			new_work_dots.push( {x:(work_dots[i].x * scale), y:(work_dots[i].y * scale)} ) ;
    		} else {
    			new_work_dots.push( work_dots[i] ) ;
    		}
		}
        if( new_work_dots.length<3 ) {
            var b = new_work_dots[0] ;
            target.beginPath() ;
            target.arc( b.x, b.y, target.lineWidth / 2, 0, Math.PI * 2, !0 ) ;
            target.fill() ;
            target.closePath();

            return ;
        }

        target.beginPath() ;
        target.moveTo( new_work_dots[0].x, new_work_dots[0].y ) ;

        for( var i = 1; i<new_work_dots.length-2; i++ ) {
            var c = (new_work_dots[i].x + new_work_dots[i + 1].x) / 2 ;
            var d = (new_work_dots[i].y + new_work_dots[i + 1].y) / 2 ;

            target.quadraticCurveTo( new_work_dots[i].x, new_work_dots[i].y, c, d ) ;
        }

        // the last 2 points are special
        target.quadraticCurveTo( new_work_dots[i].x, new_work_dots[i].y, new_work_dots[i + 1].x, new_work_dots[i + 1].y ) ;
        target.stroke() ;
    }
}


function unicode_to_char( unicode ) {
	return String.fromCharCode( "0x" + unicode ) ;
}
function char_to_unicode( char ) {
	return char[0].codePointAt(0).toString(16) ;
}

function reset() {
	work_dots = [] ;
	work_strokes = [] ;
	work_start_line = 0 ;
	work_end_line = 0 ;
	work_start_dot = { x:-1, y:-1 } ;
	work_end_dot = { x:-1, y:-1 } ;
	select_char_to_be_edited( char_being_edited, variation_index_being_edited ) ;
	build_char_variation_table() ;
}

function find_startiest_start_line() {
	var lowest_x = false ;
	for( var i=0 ; i<work_strokes.length ; i++ ) {
		for( var j=0 ; j<work_strokes[i].length ; j++ ) {
			if( lowest_x===false ||
				work_strokes[i][j].x<lowest_x ) {
				lowest_x = work_strokes[i][j].x
			}
		}
	}

	return lowest_x ;
}


function find_endiest_end_line() {
	var highest_x = false ;
	for( var i=0 ; i<work_strokes.length ; i++ ) {
		for( var j=0 ; j<work_strokes[i].length ; j++ ) {
			if( highest_x===false ||
				work_strokes[i][j].x>highest_x ) {
				highest_x = work_strokes[i][j].x
			}
		}
	}

	return highest_x ;
}


function check_start_line() {
	if( work_start_dot.x!=-1 &&
		work_start_dot.y!=-1 ) {
		// start_dot is defined, we need to make sure the start line isn't beyond it
		if( work_start_line>work_start_dot.x ) {
			work_start_line = work_start_dot.x ;
		}
	}
	if( work_start_line>(work_canvas_size-work_end_line) ) {
		work_start_line = (work_canvas_size-work_end_line) ;
	}
}
function check_end_line() {
	if( work_end_dot.x!=-1 &&
		work_end_dot.y!=-1 ) {
		// end_dot is defined, we need to make sure the end line isn't before it
		if( (work_canvas_size-work_end_line)<work_end_dot.x ) {
			work_end_line = work_canvas_size - work_end_dot.x ;
		}
	}
	if( (work_canvas_size-work_end_line)<work_start_line ) {
		work_end_line = work_canvas_size - work_start_line ;
	}
}
function start_line_left() {
	if( first_start_line_adjust &&
		find_startiest_start_line()!==false ) {
		work_start_line = find_startiest_start_line() ;
	} else {
		work_start_line-- ;
		if( work_start_line<0 ) {
			work_start_line = 0 ;
		}
	}
	check_start_line() ;
	select_char_to_be_edited( char_being_edited, variation_index_being_edited ) ;
	build_char_variation_table() ;
	first_start_line_adjust = false ;
}
function start_line_right() {
	if( first_start_line_adjust &&
		find_startiest_start_line()!==false ) {
		work_start_line = find_startiest_start_line() ;
	} else {
		work_start_line++ ;
	}
	check_start_line() ;
	select_char_to_be_edited( char_being_edited, variation_index_being_edited ) ;
	build_char_variation_table() ;
	first_start_line_adjust = false ;
}
function end_line_left() {
	if( first_end_line_adjust &&
		find_endiest_end_line()!==false ) {
		work_end_line = work_canvas_size - find_endiest_end_line() ;
	} else {
		work_end_line++ ;
	}
	check_end_line() ;
	select_char_to_be_edited( char_being_edited, variation_index_being_edited ) ;
	build_char_variation_table() ;
	first_end_line_adjust = false ;
}
function end_line_right() {
	if( first_end_line_adjust &&
		find_endiest_end_line()!==false ) {
		work_end_line = work_canvas_size - find_endiest_end_line() ;
	} else {
		work_end_line-- ;
		if( work_end_line<0 ) {
			work_end_line = 0 ;
		}
	}
	check_end_line() ;
	select_char_to_be_edited( char_being_edited, variation_index_being_edited ) ;
	build_char_variation_table() ;
	first_end_line_adjust = false ;
}


function place_start_dot_switch() {
	if( work_strokes.length==0 ) {
		alert( "you need at least one penstroke before placing a start dot" ) ;
		return false ;
	}
	if( place_start_dot ) {
		place_start_dot = false ;
	} else {
		if( first_place_start_dot ) {
			// we start with the first dot of the first stroke
			work_start_dot = {x:work_strokes[0][0].x, y:work_strokes[0][0].y} ;
			render_start_and_end_dots( work_canvas, work_start_dot, work_end_dot) ;
			render_start_and_end_dots( document.getElementById("char_variation_canvas_" + char_being_edited + "_" + variation_index_being_edited), work_start_dot, work_end_dot, work_to_variation_scale ) ;
			first_place_start_dot = false ;
			check_start_line() ;
			check_end_line() ;
		}
		place_start_dot = true ;
		place_end_dot = false ;
	}
}
function place_end_dot_switch() {
	if( work_strokes.length==0 ) {
		alert( "you need at least one penstroke before placing an end dot" ) ;
		return false ;
	}
	if( place_end_dot ) {
		place_end_dot = false ;
	} else {
		if( first_place_end_dot ) {
			// we start with the last dot of the first stroke
			work_end_dot = {x:work_strokes[0][work_strokes[0].length-1].x, y:work_strokes[0][work_strokes[0].length-1].y} ;
			render_start_and_end_dots( work_canvas, work_start_dot, work_end_dot) ;
			render_start_and_end_dots( document.getElementById("char_variation_canvas_" + char_being_edited + "_" + variation_index_being_edited), work_start_dot, work_end_dot, work_to_variation_scale ) ;
			first_place_end_dot = false ;
		}
		place_end_dot = true ;
		place_start_dot = false ;
	}
}


// function draw_debug_dot( canvas, debug_dot ) {
// 	scale = 1.0 ;

// 	console.log( "drawing debug dot at " + debug_dot.x*scale + "," + debug_dot.y*scale ) ;

// 	var canvas_context = canvas.getContext( "2d" ) ;
// 	canvas_context.strokeStyle = "black" ;
//     canvas_context.fillStyle = "black" ;
//     canvas_context.lineJoin = "round" ;
//     canvas_context.lineCap = "round" ;
//     canvas_context.lineWidth = 1 * scale ;
// 	canvas_context.beginPath() ;
//     canvas_context.moveTo( debug_dot.x*scale-5*scale, debug_dot.y*scale-5*scale ) ;
//     canvas_context.lineTo( debug_dot.x*scale+5*scale, debug_dot.y*scale+5*scale ) ;
//     canvas_context.stroke() ;
//     canvas_context.beginPath() ;
//     canvas_context.moveTo( debug_dot.x*scale-5*scale, debug_dot.y*scale+5*scale ) ;
//     canvas_context.lineTo( debug_dot.x*scale+5*scale, debug_dot.y*scale-5*scale ) ;
//     canvas_context.stroke() ;
// }

function text_changed() {
	var plotter_code = turn_into_plotter_code( document.getElementById("ht_text").value ) ;
	document.getElementById( "tcode" ).value = plotter_code ;

	if( document.getElementById("handwriting_typewriter_live_keyboard").checked ) {
		// live keyboard mode
		time_to_draw = 0 ;
		x_strokes_at_a_time = 100000 ;
		// draw_turtle_code( plotter_code, document.getElementById("preview") ) ;
		tcode_changed( 0, 100000 ) ;
	} else {
		// draw_turtle_code( plotter_code, document.getElementById("preview") ) ;
		tcode_changed() ;
	}
}

var last_char_may_have_ligature ;
function turn_into_plotter_code( text ) {
	var relative_font_height = 20 *  parseFloat(document.getElementById("text_to_pcode_size_ratio").value) ;
	var scale = relative_font_height/341.33 ; // the work canvas is 256x341.33

	var plotter_code = "" ;
	var pen_position = {x:0, y:0} ;
	var next_char_variation_index = false ;
	var plotter_code_stack = "" ;
	var ligature = false ;
	var ligature_length = 0 ;
	var first_character_on_line = true ;
	var next_shift_by = false ;
	for( var i=0 ; i<text.length ; i++ ) {
		last_char_may_have_ligature = false ;
		var unicode = char_to_unicode( text[i] ) ;
		//console.log( text[i] ) ;
		seeded_random_number_generator = new Math.seedrandom( text.substring(0,i) ) ;
		if( unicode in ffont ) {
			// picking a char variation at random
			var char_variation_index ;
			if( next_char_variation_index!==false ) {
				char_variation_index = next_char_variation_index ;
				next_char_variation_index = false ;
			} else {
				//char_variation_index = Math.floor( Math.random() * ffont[unicode].length ) ;
				char_variation_index = generate_random_integer_between_min_and_max( 0, (ffont[unicode].length-1) ) ;
			}

			var specs = ffont[unicode][char_variation_index] ;

			// do we have an end dot?
			var have_end_dot = false ;
			if( specs.end_dot.x!=-1 &&
				specs.end_dot.y!=-1 ) {
				have_end_dot = true ;
			}

			// does the next character have a start dot?
			var next_specs = false ;
			var next_has_start_dot = false ;
			var next_left_most_x = false ;
			var next_right_most_x = false ;
			if( i<(text.length-1) && text[i+1]!="\n" ) {
				var next_unicode = char_to_unicode( text[i+1] ) ;
				//next_char_variation_index = Math.floor( Math.random() * ffont[next_unicode].length ) ;
				next_char_variation_index = generate_random_integer_between_min_and_max( 0, (ffont[next_unicode].length-1) ) ;
				next_specs = ffont[next_unicode][next_char_variation_index] ;
				if( next_specs.start_dot.x!=-1 &&
					next_specs.start_dot.y!=-1 ) {
					next_has_start_dot = true ;
				}
				for( j=0 ; j<(next_specs.strokes.length) ; j++ ) {
					for( k=0 ; k<(next_specs.strokes[j].length-1) ; k++ ) {
						if( next_left_most_x===false ||
							next_specs.strokes[j][k].x>next_right_most_x ) {
							next_right_most_x = next_specs.strokes[j][k].x ;
						}
						if( next_left_most_x===false ||
							next_specs.strokes[j][k].x<next_left_most_x ) {
							next_left_most_x = next_specs.strokes[j][k].x ;
						}
					}
				}
			}
			
			// are we on the last character and it may have a ligature
			if( i==(text.length-1) ) {
				if( specs.end_dot.x!=-1 &&
					specs.end_dot.y!=-1 ) {
					last_char_may_have_ligature = true ;
				}
			}

			// if we are coming from a ligature, we need to find the right penstroke and the right location
			var start_dot_at_k = 0 ;
			if( ligature ) {
				var found_start_dot_at_j = false ;
				for( j=0 ; j<specs.strokes.length ; j++ ) {
					for( k=0 ; k<specs.strokes[j].length ; k++ ) {
						if( specs.strokes[j][k].x==specs.start_dot.x &&
							specs.strokes[j][k].y==specs.start_dot.y ) {
							found_start_dot_at_j = j ;
							start_dot_at_k = k ;
							break ;
							break ;
						}
					}
				}
				if( found_start_dot_at_j!==false && found_start_dot_at_j!==0 ) {
					// we reorder so that it's the first one
					var add_to_start_instead = specs.strokes.splice( found_start_dot_at_j, 1 )[0] ;
					specs.strokes.unshift( add_to_start_instead ) ;
				}
			}

			// how much do we shift by?
			shift_by = 0 ;
			if( first_character_on_line ) {
				// doesn't work, results in negative x at the beginning of the line
				// shift_by = specs.start_line ;
				
				first_character_on_line = false ;
				
				// we use the lowest x of the char instead
				lowest_x = 0 ;
				for( j=0 ; j<specs.strokes.length ; j++ ) {
					for( k=0 ; k<specs.strokes[j].length ; k++ ) {
						if( lowest_x===0 ||
							specs.strokes[j][k].x<lowest_x ) {
							lowest_x = specs.strokes[j][k].x ;
						}
					}
				}
				shift_by = lowest_x ;
			} else if( ligature ) {
				shift_by = specs.start_dot.x ;
			} else if( next_shift_by!==false ) {
				shift_by = next_shift_by ;
				//console.log( "shift_by " + shift_by ) ;
				next_shift_by = false ;
			} else if( specs.start_line!=0 ) {
				shift_by = specs.start_line ;
			} else {
				console.log( "TODO: unhandled #i48htreg" ) ;
				shift_by = 0 ;
			}

			ligature = false ;
			for( j=0 ; j<specs.strokes.length ; j++ ) {
				cords = {x:pen_position.x + (specs.strokes[j][start_dot_at_k].x-shift_by)*scale,
					     y:pen_position.y + (specs.strokes[j][start_dot_at_k].y)*scale} ;
				plotter_code += "go_to( " + cords.x + ", " + (canvas_max_y-cords.y) + ")\n" ;
				plotter_code += "pen_down()\n" ;


				for( k=start_dot_at_k+1 ; k<specs.strokes[j].length ; k++ ) {
					cords = {x:pen_position.x + (specs.strokes[j][k].x-shift_by)*scale,
					         y:pen_position.y + (specs.strokes[j][k].y)*scale} ;
					plotter_code += "go_to( " + cords.x + ", " + (canvas_max_y-cords.y) + ")\n" ;

					if( have_end_dot && next_has_start_dot ) {
						if( specs.strokes[j][k].x==specs.end_dot.x &&
							specs.strokes[j][k].y==specs.end_dot.y ) {
							// we don't draw the rest of the stroke
							// we stack the rest of the strokes
							// no need to pen_up()
							ligature = true ;

							// method 1: ligature is finishing this penstroke with next start_dot as gravity point
							// ligature_gravity_point = {y:next_specs.start_dot.y, total:0} ;
							// for( o=k+1 ; o<specs.strokes[j].length ; o++ ) {
							// 	ligature_gravity_point.total++ ;
							// }
							// for( o=k+1 ; o<specs.strokes[j].length ; o++ ) {
							// 	cords = {x:pen_position.x + (specs.strokes[j][o].x-shift_by)*scale,
							// 	         //y:pen_position.y + (specs.strokes[j][o].y)*scale} ;
							// 	         y:pen_position.y + ( specs.strokes[j][o].y/(((ligature_gravity_point.y/specs.strokes[j][o].y)-1.0)*(k+1-o)/(specs.strokes[j].length-(k+1))+1.0) )*scale} ;
							// 	plotter_code += "go_to( " + cords.x + ", " + (canvas_max_y-cords.y) + ")\n" ;
							// }
							// ligature_length = specs.strokes[j][specs.strokes[j].length-1].x - specs.end_dot.x ;

							// method 2: ligature is the beginning of the next penstroke biaised towards the end of current stroke
							// var end_of_current_stroke = [] ;
							// for( o=k+1 ; o<specs.strokes[j].length ; o++ ) {
							// 	end_of_current_stroke.push( {x:specs.strokes[j][o].x, y:specs.strokes[j][o].y} ) ;
							// }
							// var beginning_of_next_stroke = [] ;
							// for( p=0 ; p<next_specs.strokes.length ; p++ ) {
							// 	for( q=0 ; q<next_specs.strokes[p].length ; q++ ) {
							// 		// console.log( p + "," + q ) ;
							// 		if( next_specs.strokes[p][q].x==next_specs.start_dot.x &&
							// 			next_specs.strokes[p][q].y==next_specs.start_dot.y ) {
							// 			// that's the one!
							// 			for( r=q ; r>=0 ; r-- ) {
							// 				beginning_of_next_stroke.push( {x:next_specs.strokes[p][r].x, y:next_specs.strokes[p][r].y} ) ;
							// 			}
							// 			break ;
							// 			break ;
							// 		}
							// 	}
							// }
							// // console.log( "end_of_current_stroke" ) ;
							// // console.log( end_of_current_stroke ) ;
							// // console.log( "beginning_of_next_stroke" ) ;
							// // console.log( beginning_of_next_stroke ) ;
							// var end_of_current_stroke_x_distance    = end_of_current_stroke[end_of_current_stroke.length-1].x - end_of_current_stroke[0].x ;
							// var beginning_of_next_stroke_x_distance = beginning_of_next_stroke[0].x - beginning_of_next_stroke[beginning_of_next_stroke.length-1].x ;
							// // we shift the beginning of next stroke
							// var shifty = specs.end_dot.x - beginning_of_next_stroke[beginning_of_next_stroke.length-1].x ;
							// for( var r=0 ; r<beginning_of_next_stroke.length ; r++ ) {
							// 	beginning_of_next_stroke[r].x = beginning_of_next_stroke[r].x + shifty ;
							// }
							// // // drawing debug dot
							// // var debug_dot = {x:pen_position.x + (meeting_x-shift_by)*scale,
							// // 	             y:pen_position.y + (meeting_y)*scale} ;
							// // console.log( "debug_dot:"  ) ;
							// // console.log( debug_dot ) ;
							// // plotter_code += "pen_up()\n" ;
							// // plotter_code += "go_to( " + (debug_dot.x+2) + ", " + (canvas_max_y-debug_dot.y+2) + ")\n" ;
							// // plotter_code += "pen_down()\n" ;
							// // plotter_code += "go_to( " + (debug_dot.x-2) + ", " + (canvas_max_y-debug_dot.y-2) + ")\n" ;
							// // plotter_code += "pen_up()\n" ;
							// // plotter_code += "go_to( " + (debug_dot.x-2) + ", " + (canvas_max_y-debug_dot.y+2) + ")\n" ;
							// // plotter_code += "pen_down()\n" ;
							// // plotter_code += "go_to( " + (debug_dot.x+2) + ", " + (canvas_max_y-debug_dot.y-2) + ")\n" ;
							// // // plotter_code += "pen_up()\n" ;
							// var ligature_dots = [] ;
							// for( var s=0 ; s<beginning_of_next_stroke.length ; s++ ) {
							// 	// TODO, we should try to involes some dots from the end_of_current_stroke to avoid sharp turns
							// 	var lig_dot = {x:beginning_of_next_stroke[s].x,
							// 				   //y:beginning_of_next_stroke[s].y} ;
							// 		           y:beginning_of_next_stroke[s].y * (s*((specs.end_dot.y/beginning_of_next_stroke[s].y)-1)/(beginning_of_next_stroke.length-1)+1) } ;
							// 	ligature_dots.unshift( lig_dot ) ;
							// }

							// method 3 ligature is the beginning of the next penstroke with each point correlated to the closest point of the end of the current penstroke
							var end_of_current_stroke = [] ;
							for( o=k+1 ; o<specs.strokes[j].length ; o++ ) {
								end_of_current_stroke.push( {x:specs.strokes[j][o].x, y:specs.strokes[j][o].y} ) ;
							}
							var beginning_of_next_stroke = [] ;
							for( p=0 ; p<next_specs.strokes.length ; p++ ) {
								for( q=0 ; q<next_specs.strokes[p].length ; q++ ) {
									// console.log( p + "," + q ) ;
									if( next_specs.strokes[p][q].x==next_specs.start_dot.x &&
										next_specs.strokes[p][q].y==next_specs.start_dot.y ) {
										// that's the one!
										// for( r=q ; r>=0 ; r-- ) {
										for( r=0 ; r<=q ; r++ ) {
											beginning_of_next_stroke.push( {x:next_specs.strokes[p][r].x, y:next_specs.strokes[p][r].y} ) ;
										}
										break ;
										break ;
									}
								}
							}
							var end_of_current_stroke_x_distance    = end_of_current_stroke[end_of_current_stroke.length-1].x - end_of_current_stroke[0].x ;
							var beginning_of_next_stroke_x_distance = beginning_of_next_stroke[0].x - beginning_of_next_stroke[beginning_of_next_stroke.length-1].x ;
							// we shift the beginning of next stroke
							var shifty = specs.end_dot.x - beginning_of_next_stroke[0].x ;
							for( var r=0 ; r<beginning_of_next_stroke.length ; r++ ) {
								beginning_of_next_stroke[r].x = beginning_of_next_stroke[r].x + shifty ;
							}
							var ligature_dots = [] ;
							// console.log( beginning_of_next_stroke ) ;
							// console.log( end_of_current_stroke ) ;
							for( var s=0 ; s<beginning_of_next_stroke.length ; s++ ) {
								var closest_dot_from_end_of_current_stroke = false ;
								var closest_dot_from_end_of_current_stroke_distance = false ;
								for( var t=0 ; t<end_of_current_stroke.length ; t++ ) {
									var potential_distance = Math.abs( (beginning_of_next_stroke[s].x-beginning_of_next_stroke[0].x)-(end_of_current_stroke[t].x-end_of_current_stroke[0].x) ) ;
									//console.log( potential_distance ) ;
									if( closest_dot_from_end_of_current_stroke_distance===false ||
										potential_distance<closest_dot_from_end_of_current_stroke_distance ) {
										closest_dot_from_end_of_current_stroke_distance = potential_distance ;
										closest_dot_from_end_of_current_stroke = end_of_current_stroke[t] ;
									}
								}

								var end_of_current_stroke_weigth = beginning_of_next_stroke.length - 1 - s ;
								var beginning_of_next_stroke_weigth = s ;

								// console.log( "on dot: " ) ;
								// console.log( beginning_of_next_stroke[s] ) ;
								// console.log( "closest dot: " ) ;
								// console.log( closest_dot_from_end_of_current_stroke ) ;

								// console.log( "------" ) ;
								// console.log( closest_dot_from_end_of_current_stroke ) ;
								// console.log( end_of_current_stroke_weigth ) ;
								// console.log( beginning_of_next_stroke_weigth ) ;
										
								var lig_dot = {x:beginning_of_next_stroke[s].x,
											   //y:beginning_of_next_stroke[s].y } ;
											   y:((beginning_of_next_stroke[s].y*beginning_of_next_stroke_weigth)+(closest_dot_from_end_of_current_stroke.y*end_of_current_stroke_weigth))/(end_of_current_stroke_weigth+beginning_of_next_stroke_weigth) };
											   // y:(closest_dot_from_end_of_current_stroke.y*end_of_current_stroke_weigth+beginning_of_next_stroke[s].y*beginning_of_next_stroke_weigth)/(end_of_current_stroke_weigth+beginning_of_next_stroke_weigth)} ;
											   // y:beginning_of_next_stroke[s].y} ;
									           // y:beginning_of_next_stroke[s].y * (s*((specs.end_dot.y/beginning_of_next_stroke[s].y)-1)/(beginning_of_next_stroke.length-1)+1) } ;
								//ligature_dots.unshift( lig_dot ) ;
								ligature_dots.push( lig_dot ) ;
							}


							ligature_length = ligature_dots[ligature_dots.length-1].x - ligature_dots[0].x ;
							for( var s=0 ; s<ligature_dots.length ; s++ ) {
								cords = {x:pen_position.x + (ligature_dots[s].x-shift_by)*scale,
					     		         y:pen_position.y + (ligature_dots[s].y)*scale}
								plotter_code += "go_to( " + cords.x + ", " + (canvas_max_y-cords.y) + ")\n" ;
							}

							// console.log( "+++++++++++" ) ;

							break ;
						}
					}
				}
				//console.log( plotter_code ) ;
				if( ligature ) {
					for( jj=j+1 ; jj<specs.strokes.length ; jj++ ) {
						cords = {x:pen_position.x + (specs.strokes[jj][0].x-shift_by)*scale,
					     		 y:pen_position.y + (specs.strokes[jj][0].y)*scale}
						plotter_code_stack += "go_to( " + cords.x + ", " + (canvas_max_y-cords.y) + ")\n" ;
						plotter_code_stack += "pen_down()\n" ;
						for( kk=1 ; kk<specs.strokes[jj].length ; kk++ ) {
							cords = {x:pen_position.x + (specs.strokes[jj][kk].x-shift_by)*scale,
							         y:pen_position.y + (specs.strokes[jj][kk].y)*scale}
							plotter_code_stack += "go_to( " + cords.x + ", " + (canvas_max_y-cords.y) + ")\n" ;
						}
						plotter_code_stack += "pen_up()\n" ;
					}
					j = specs.strokes.length ;
				} else {
					plotter_code += "pen_up()\n" ;
					if( plotter_code_stack!="" ) {
						plotter_code += plotter_code_stack ;
						plotter_code_stack = "" ;
					}
				}
				start_dot_at_k = 0 ;
			}

			// updating pen position
			if( ligature ) {
				pen_position.x += (specs.end_dot.x + ligature_length - shift_by)*scale ;
			// } else if( !have_end_dot && specs.strokes.length>0 && next_has_start_dot ) {
			// 	// we try to collate letters in that case
			// 	// we collision detect between the current main stroke and the next main stroke
			// 	var collision = false ;
			// 	var next_shift_by = 256*2 ;
			// 	while( !collision && to_shift>=0 ) {
			// 		for( v=0 ; v<(specs.strokes[0].length-1) ; v++ ) {
			// 			for( w=0 ; w<(next_specs.strokes[0].length-1) ; w++ ) {
			// 				intersect = calculate_intersect( specs.strokes[0][v], specs.strokes[0][v+1], next_specs.strokes[0][w], next_specs.strokes[0][w+1] ) ;
			// 				if( (intersect.x>specs.strokes[0][v].x &&
			// 					 intersect.x>specs.strokes[0][v+1].x &&
			// 					 intersect.x>next_specs.strokes[0][w].x &&
			// 					 intersect.x>next_specs.strokes[0][w+1].x) ||
			// 				    (intersect.x<specs.strokes[0][v].x &&
			// 					 intersect.x<specs.strokes[0][v+1].x &&
			// 					 intersect.x<next_specs.strokes[0][w].x &&
			// 					 intersect.x<next_specs.strokes[0][w+1].x) ||
			// 				    (intersect.y>specs.strokes[0][v].y &&
			// 					 intersect.y>specs.strokes[0][v+1].y &&
			// 					 intersect.y>next_specs.strokes[0][w].y &&
			// 					 intersect.y>next_specs.strokes[0][w+1].y) ||
			// 				    (intersect.y<specs.strokes[0][v].y &&
			// 					 intersect.y<specs.strokes[0][v+1].y &&
			// 					 intersect.y<next_specs.strokes[0][w].y &&
			// 					 intersect.y<next_specs.strokes[0][w+1].y) ) {
			// 					// no collision, redundant but more readable
			// 					collision = false ;
			// 				} else {
			// 					collision = true ;
			// 				}
			// 			}
			// 		}
			// 		if( !collision ) {
			// 			to_shift-- ;
			// 		}
			// 	}
			// 	if( collision ) {
			// 		pen_position.x += (to_shift - shift_by)*scale ;
			// 	} else {
			// 		console.log( "TODO: unhandled ihtwukrlsh, but honestly I don't know how we don't have a collision here" ) ;
			//
			} else if( i==(text.length-1) ) {
				; // last char, nothing's coming next
			} else if( specs.end_line!=0 ) {
				pen_position.x += (256 - specs.end_line - shift_by)*scale ;
			} else if( have_end_dot && !next_has_start_dot ) {
				// we find the end of the letter and we put the pen there
				var temp_pen_position = false ;
				for( a=0 ; a<specs.strokes.length && temp_pen_position===false ; a++ ) {
					for( b=0 ; b<specs.strokes[a].length && temp_pen_position===false ; b++ ) {
						if( specs.strokes[a][b].x==specs.end_dot.x &&
							specs.strokes[a][b].y==specs.end_dot.y ) {
							// console.log( specs.strokes[a] ) ;
							temp_pen_position = {x:specs.strokes[a][specs.strokes[a].length-1].x, y:specs.strokes[a][specs.strokes[a].length-1].y} ;
						}
					}
				}
				// console.log( temp_pen_position ) ;
				pen_position.x += (temp_pen_position.x - shift_by)*scale ;

				//console.log( "Y_pos" +  temp_pen_position.y ) ;
				next_shift_by = 0 ;
				var found = false ;
				while( next_shift_by<256 && !found ) {
					var temp_pen_position_line_point_a = {x:next_shift_by, y:temp_pen_position.y} ;
					var temp_pen_position_line_point_b = {x:next_shift_by+1, y:temp_pen_position.y} ;
					for( v=0 ; v<next_specs.strokes.length && !found ; v++ ) {
						for( w=0 ; w<(next_specs.strokes[v].length-1) && !found ; w++ ) {
							if( (next_specs.strokes[v][w].y<=temp_pen_position.y && temp_pen_position.y<=next_specs.strokes[v][w+1].y) ||
								(next_specs.strokes[v][w].y>=temp_pen_position.y && temp_pen_position.y>=next_specs.strokes[v][w+1].y) ) {
								var intersect = calculate_intersect( temp_pen_position_line_point_a, temp_pen_position_line_point_b, next_specs.strokes[v][w], next_specs.strokes[v][w+1] ) ;
								if( !isNaN(intersect.x) &&
									isFinite(intersect.x) &&
									(temp_pen_position_line_point_a.x<=intersect.x && intersect.x<=temp_pen_position_line_point_b.x ||
									 temp_pen_position_line_point_a.x>=intersect.x && intersect.x>=temp_pen_position_line_point_b.x) ) {
									// console.log( intersect ) ;
									found = true ;
								}
							}
						}
					}
					next_shift_by++ ;
				}

				if( next_shift_by===0 ) {
					console.log( next_shift_by ) ;
					next_shift_by = false ;
				}
			} else {
				// console.log( temp_pen_position ) ;
				// if( temp_pen_position===false ) {
				// 	var right_most_x = false ;
				// 	for( a=0 ; a<(specs.strokes.length-1) ; a++ ) {
				// 		for( b=0 ; b<(specs.strokes[a].length-1) ; b++ ) {
				// 			if( right_most_x===false ||
				// 				specs.strokes[a][b].x>right_most_x ) {
				// 				right_most_x = specs.strokes[a][b].x ;
				// 			}
				// 		}
				// 	}
				// 	temp_pen_position = right_most_x ;
				// }
				// console.log( temp_pen_position ) ;
				pen_position.x += (256 - shift_by)*scale ;
				console.log( "TODO: unhandled #th9y5rj" ) ;
			}

			// new line?
			// TODO improve, don't break words, also too much room at the end
			// if( pen_position.x>=canvas_max_x-(256*scale) ||
			if( pen_position.x>=canvas_max_x-((next_right_most_x-next_left_most_x)*scale) ||
				text[i+1]=="\n" ) {
				pen_position.x = 0 ;
				pen_position.y += relative_font_height*0.65 ;
				plotter_code += "pen_up()\n" ;
				ligature = false ;
				first_character_on_line = true ;
			}

			if( i==(text.length-2) &&
				last_char_may_have_ligature===true &&
				document.getElementById("handwriting_typewriter_live_keyboard").checked &&
				have_end_dot ) {
				// in ht_live_keyboard mode, we don't want to render the last character if it may have a ligature as it might differ on the next character added
				i++ ; // that's one way to skip rendering it
			}
		} else {
			console.log( "TODO: should we replace the char with a space?" ) ;
		}
	}
	return plotter_code ;
}


// taken from https://stackoverflow.com/a/30800715
function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}


function calculate_intersect( line_1_point_1, line_1_point_2, line_2_point_1, line_2_point_2 ) {
    // implementation numero uno
    // var intersect_x = ( (line_1_point_2.x*line_1_point_1.y-line_1_point_1.x*line_1_point_2.y)*(line_2_point_2.x-line_2_point_1.x)-(line_2_point_2.x*line_2_point_1.y-line_2_point_1.x*line_2_point_2.y)*(line_1_point_2.x-line_1_point_1.x) ) / ( (line_1_point_2.x-line_1_point_1.x)*(line_2_point_2.y-line_2_point_1.y)-(line_2_point_2.x-line_2_point_1.x)*(line_1_point_2.y-line_1_point_1.y) ) ;
    // var intersect_y = ( (line_1_point_2.x*line_1_point_1.y-line_1_point_1.x*line_1_point_2.y)*(line_2_point_2.y-line_2_point_1.y)-(line_2_point_2.x*line_2_point_1.y-line_2_point_1.x*line_2_point_2.y)*(line_1_point_2.y-line_1_point_1.y) ) / ( (line_1_point_2.x-line_1_point_1.x)*(line_2_point_2.y-line_2_point_1.y)-(line_2_point_2.x-line_2_point_1.x)*(line_1_point_2.y-line_1_point_1.y) ) ;
    // return {x:intersect_x, y:intersect_y} ;

    // implementation numero dos
    var x1 = line_1_point_1.x ;
    var y1 = line_1_point_1.y ;
    var x2 = line_1_point_2.x ;
    var y2 = line_1_point_2.y ;
    var x3 = line_2_point_1.x ;
    var y3 = line_2_point_1.y ;
    var x4 = line_2_point_2.x ;
    var y4 = line_2_point_2.y ;
    var intersect_x = ( (x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4) ) / ( (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4) ) ;
    var intersect_y = ( (x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4) ) / ( (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4) ) ;
    return {x:intersect_x, y:intersect_y} ;
}

var ht_committed_text ;
var ht_committed_pcode ;
var ht_send_delta_timeout_id ;
var ht_ok_to_send_more ;
function handwriting_typewriter_live_keyboard() {
	if( document.getElementById("handwriting_typewriter_live_keyboard").checked ) {
		ajax_call( "command.php", ["command", "ht_live_keyboard_on"], null ) ;
		ht_committed_text = "" ;
		ht_committed_pcode = "" ;
		ht_send_delta_timeout_id = null ;
		ht_ok_to_send_more = true ;
		document.getElementById( "ht_text" ).value = "" ;
		document.getElementById( "gcode" ).value = "" ;
		document.getElementById( "tcode" ).value = "" ;
		document.getElementById( "ht_text").focus() ;
	} else {
		ajax_call( "command.php", ["command", "ht_live_keyboard_off"], null ) ;
	}
}
function ht_send_delta() {
	if( document.getElementById("handwriting_typewriter_live_keyboard").checked &&
		ht_ok_to_send_more &&
		last_char_may_have_ligature===false ) {
		clearTimeout( ht_send_delta_timeout_id ) ;
		ht_send_delta_timeout_id = setTimeout( function() {
			var text = document.getElementById( "ht_text" ).value ;
			// if( last_char_may_have_ligature===true ) {
			// 	text = text.substring( 0, text.length-1 ) ;
			// }
			var pcode = document.getElementById( "tcode" ).value ;
			if( text.indexOf(ht_committed_text)===-1 ||
				pcode.indexOf(ht_committed_pcode)===-1 ) {
				// you can't change committed_text
				document.getElementById("ht_text").value = ht_committed_text ;
				document.getElementById("tcode").value = ht_committed_pcode ;
			} else {
				var delta_text = text.substring( ht_committed_text.length ) ;
				var delta_pcode = pcode.substring( ht_committed_pcode.length ) ;
				// console.log( delta_text ) ;
				// console.log( delta_pcode ) ;

				ht_ok_to_send_more = false ;
				ajax_call( "command.php", ["command", "add_to_ht_penstrokes",
					                       "data", JSON.stringify(delta_pcode)], function() {
					ht_ok_to_send_more = true ;
				} ) ;

				ht_committed_text = text ;
				ht_committed_pcode = pcode ;
			}
		}, 1000 ) ;
	}
}
