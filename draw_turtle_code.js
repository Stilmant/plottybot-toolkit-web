var draw_turtle_code_timeout_id = false ;

function draw_turtle_code( go_to_code, canvas, time_to_draw, x_strokes_at_a_time, line_number, from_X, from_Y, pen_down ) {
	line_number=typeof line_number!=='undefined'?line_number:0 ;
	from_X=typeof from_X!=='undefined'?from_X:false ;
	from_Y=typeof from_Y!=='undefined'?from_Y:false ;
	pen_down=typeof pen_down!=='undefined'?pen_down:false ;

	var ctx = canvas.getContext('2d') ;
	ctx.strokeStyle = "#000000" ;

	if( line_number==0 ) {
		clearTimeout( draw_turtle_code_timeout_id ) ;
		ctx.clearRect( 0, 0, canvas.width, canvas.height ) ;
		go_to_code = go_to_code.replace( " ", "" ) ;
		go_to_code = go_to_code.toLowerCase() ;
		go_to_code = go_to_code.split( "\n" ) ;
	}

	// // no normalization
	// normalizing_ratio_X = 1.0 ;
	// normalizing_ratio_Y = 1.0 ;

	// preview_ratio
	normalizing_ratio_X = preview_ratio ;
	normalizing_ratio_Y = preview_ratio ;

	for( var i=line_number ; i<go_to_code.length ; i++ ) {
		var line = go_to_code[i] ;
		line = line.split( "(" ) ;
		if( line.length==2 ) {
			command = line[0] ;
			params = line[1].replace( ")", "" ).split( "," ) ;
			if( command=="go_to" ) {
				if( from_X===false ) {
					from_X = 50.0 ;
				}
				if( from_Y===false ) {
					from_Y = 50.0 ;
				}
				// from_X = false ;
				// from_Y = false ;
				to_X = false ;
				to_Y = false ;
				/*if( params[0]!==void 0 ) {
					from_X = parseFloat( params[0] ) ;
				}
				if( params[1]!==void 0 ) {
					from_Y = parseFloat( params[1] ) ;
				}*/
				if( params[0]!==void 0 ) {
					to_X = parseFloat( params[0] ) ;
				}
				if( params[1]!==void 0 ) {
					to_Y = parseFloat( params[1] ) ;
				}
				if( from_X!==false &&
					from_Y!==false &&
					to_X!==false &&
					to_Y!==false ) {
					to_X_orig = to_X ;
					to_Y_orig = to_Y ;
					from_X = from_X * normalizing_ratio_X ;
					from_Y = canvas.height - from_Y * normalizing_ratio_Y ;
					to_X = to_X * normalizing_ratio_X ;
					to_Y = canvas.height - to_Y * normalizing_ratio_Y ;
					if( pen_down===true ) {
						ctx.beginPath() ;
						ctx.moveTo( from_X, from_Y ) ;
						ctx.lineTo( to_X, to_Y ) ;
						ctx.stroke() ;
					}
					from_X = to_X_orig ;
					from_Y = to_Y_orig ;
				}
			}

			if( command=="pen_up" ) {
				pen_down = false ;
			}

			if( command=="pen_down" ) {
				pen_down = true ;
			}

			if( command=="color" ) {
				param = line[1].replace( "(", "" ).replace( ")", "" ).trim() ;
				ctx.strokeStyle = param ;
			}
		}

		if( i%x_strokes_at_a_time==0 && i<go_to_code.length-1 ) {
			draw_turtle_code_timeout_id = setTimeout( function() { draw_turtle_code( go_to_code, canvas, time_to_draw, x_strokes_at_a_time, i+1, from_X, from_Y, pen_down ) ; }, (time_to_draw*1000)/(go_to_code.length/x_strokes_at_a_time) ) ;
			return false ;
		}
	}
}