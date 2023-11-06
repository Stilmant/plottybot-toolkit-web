function gcode_to_turtle( gcode, normalize, aggregation_algorithm, aggregation_algorithm_anchor_point, skip_pen_jump_shorter_than ) {
	normalize = (typeof normalize!=="undefined")?normalize:true ;
	aggregation_algorithm = (typeof aggregation_algorithm!=="undefined")?aggregation_algorithm:"none" ;
	aggregation_algorithm_anchor_point = (typeof aggregation_algorithm_anchor_point!=="undefined")?aggregation_algorithm_anchor_point:false ;
	
	var path_optimization = false ;
	var path_optimization_allow_reverse = false ;
	var path_optimization_anchor = false ;
	if( aggregation_algorithm=="next_closest" ) {
		path_optimization = true ;
	} else if( aggregation_algorithm=="next_closest_allow_reverse" ) {
		path_optimization = true ;
		path_optimization_allow_reverse = true ;
	} else if( aggregation_algorithm=="polarized" ) {
		if( aggregation_algorithm_anchor_point.x<0 ||
			aggregation_algorithm_anchor_point.x>last_status['canvas_max_x'] ||
			aggregation_algorithm_anchor_point.y<0 ||
			aggregation_algorithm_anchor_point.y>last_status['canvas_max_y'] ) {
			console.error( "aggregation_algorithm_anchor_point out of range with:" ) ;
			console.error( aggregation_algorithm_anchor_point ) ;
		} else {
			path_optimization = true ;
			path_optimization_anchor = aggregation_algorithm_anchor_point ;
		}
	} else if( aggregation_algorithm=="none" ) {
		;
	} else {
		console.error( "unknown aggregation_algorithm" ) ;
	}

	var lowest_x = false ;
	var lowest_y = false ;
	var highest_x = false ;
	var highest_y = false ;

	// finding paths
	var paths = [] ;
	gcode = gcode.split( "(Start cutting path id:" ) ;
	for( var i=1 ; i<gcode.length ; i++ ) {
		path = gcode[i] ;
		path = path.split( "(End cutting path id:" ) ;
		path = path[0] ;
		path = path.split( "\n" ) ;
		var new_path = {'cords':[]} ;
		for( var j=0 ; j<path.length ; j++ ) {
			line = path[j] ;
			line = line.split( " " ) ;
			X = false ;
			Y = false ;
			for( var k=0 ; k<line.length ; k++ ) {
				item = line[k] ;
				var first_char = item.substring( 0, 1 ) ;
				var the_rest = item.substring( 1 ) ;
				if( first_char=="X" ) {
					X = parseFloat( the_rest ) ;
				} else if( first_char=="Y" ) {
					Y = parseFloat( the_rest ) ;
				}
			}

			if( X!==false && Y!==false ) {
				if( X!==false && (X<lowest_x || lowest_x===false) ) {
					lowest_x = X ;
				}
				if( Y!==false && (Y<lowest_y || lowest_y===false) ) {
					lowest_y = Y ;
				}
				if( X!==false && (X>highest_x || highest_x===false) ) {
					highest_x = X ;
				}
				if( Y!==false && (Y>highest_y || highest_y===false) ) {
					highest_y = Y ;
				}

				if( !('origin' in new_path) ) {
					new_path['origin'] = {x:X, y:Y} ;
				}
				new_path['cords'].push( {x:X, y:Y} ) ;

			}
		}
		if( new_path['cords'].length>0 ) {
			new_path['destination'] = {x:new_path['cords'][new_path['cords'].length-1].x, y:new_path['cords'][new_path['cords'].length-1].y} ;
			paths.push( new_path ) ;
		}
	}

	// normalization & shifting if needs be
	if( normalize ) {
		var normalizing_ratio = 1.0 ;
		var normalizing_ratio_x = canvas_max_x / (highest_x-lowest_x) ;
		var normalizing_ratio_y = canvas_max_y / (highest_y-lowest_y) ;
		var normalizing_ratio = Math.min( normalizing_ratio_x, normalizing_ratio_y ) ;
		for( i=0 ; i<paths.length ; i++ ) {
			paths[i]['origin'].x = (paths[i]['origin'].x - lowest_x) * normalizing_ratio
			paths[i]['origin'].y = (paths[i]['origin'].y - lowest_y) * normalizing_ratio
			paths[i]['destination'].x = (paths[i]['destination'].x - lowest_x) * normalizing_ratio
			paths[i]['destination'].y = (paths[i]['destination'].y - lowest_y) * normalizing_ratio
			for( j=0 ; j<paths[i]['cords'].length ; j++ ) {
				paths[i]['cords'][j].x = (paths[i]['cords'][j].x - lowest_x) * normalizing_ratio ;
				paths[i]['cords'][j].y = (paths[i]['cords'][j].y - lowest_y) * normalizing_ratio ;
			}
		}
	}

	var distance_between_penstrokes = 0 ;
	for( i=1 ; i<paths.length ; i++ ) {
		distance_between_penstrokes += Math.sqrt( Math.pow(paths[i]['origin'].x-paths[i-1]['destination'].x, 2) + Math.pow(paths[i-1]['origin'].y-paths[i-1]['destination'].y, 2) ) ;
	}
	// console.log( "> distance_between_penstrokes before optimization" + distance_between_penstrokes ) ;

	//optimizing order based on location
	var new_paths = [] ;
	if( !path_optimization ) {
		new_paths = paths ;
	} else {
		if( path_optimization_anchor===false ) {
			new_paths.push( paths.shift() ) ;
		}
		while( paths.length>0 ) {
			var last_x, last_y ;
			if( path_optimization_anchor!==false ) {
				last_x = path_optimization_anchor.x ;
				last_y = path_optimization_anchor.y ;
			} else {
				last_x = new_paths[new_paths.length-1]['destination'].x ;
				last_y = new_paths[new_paths.length-1]['destination'].y ;
			}

			closest_path_index = false ;
			closest_path_distance = false ;
			closest_path_reverse = false ;

			for( i=0 ; i<paths.length ; i++ ) {
				var distance_origin      = Math.sqrt( Math.pow(paths[i]['origin'].x-last_x, 2) + Math.pow(paths[i]['origin'].y-last_y, 2) ) ;
				var distance_destination = distance_origin + 1 ;
				if( path_optimization_allow_reverse ) {
					distance_destination = Math.sqrt( Math.pow(paths[i]['destination'].x-last_x, 2) + Math.pow(paths[i]['destination'].y-last_y, 2) ) ;
				}
				if( closest_path_distance===false ||
					distance_origin<closest_path_distance ||
					distance_destination<closest_path_distance) {
					if( distance_destination<distance_origin ) {
						closest_path_distance = distance_destination ;
						closest_path_reverse = true ;
					} else {
						closest_path_distance = distance_origin ;
						closest_path_reverse = false ;
					}
					closest_path_index = i ;
				}
			}

			if( closest_path_reverse ) {
				var saved_origin = paths[closest_path_index]['origin'] ;
				var saved_destination = paths[closest_path_index]['destination'] ;
				var saved_cords = paths[closest_path_index]['cords'] ;
				saved_cords = saved_cords.reverse() ;
				paths[closest_path_index]['origin'] = saved_destination ;
				paths[closest_path_index]['destination'] = saved_origin ;
				paths[closest_path_index]['cords'] = saved_cords ;
			}

			new_paths.push( paths[closest_path_index] ) ;
			paths.splice( closest_path_index, 1 ) ;
		}
	}
	


	// var distance_between_penstrokes = 0 ;
	// for( i=1 ; i<new_paths.length ; i++ ) {
	// 	distance_between_penstrokes += Math.sqrt( Math.pow(new_paths[i]['origin'].x-new_paths[i-1]['destination'].x, 2) + Math.pow(new_paths[i-1]['origin'].y-new_paths[i-1]['destination'].y, 2) ) ;
	// }
	//console.log( "> distance_between_penstrokes after optimization" + distance_between_penstrokes ) ;
	
	// ok generating output
	var output = "" ;
	output += "pen_up()\n" ;
	var last_x = false ;
	var last_y = false ;
	var skip_next_pen_down = false ;
	for( var i=0 ; i<new_paths.length ; i++ ) {
		for( var j=0 ; j<new_paths[i]['cords'].length ; j++ ) {
			last_x = new_paths[i]['cords'][j].x ;
			last_y = new_paths[i]['cords'][j].y ;
			// if( !(skip_next_pen_down && j==0) ) {
				output += "go_to( " + new_paths[i]['cords'][j].x + ", " + new_paths[i]['cords'][j].y + " )\n" ;
			// }
			if( j==0 && !skip_next_pen_down ) {
				output += "pen_down()\n" ;
			}
			if( skip_next_pen_down ) {
				skip_next_pen_down = false ;
			}
		}
		if( i<(new_paths.length-1) &&
			new_paths[i+1]['cords'].length>=1 &&
			((new_paths[i+1]['cords'][0].x==last_x && new_paths[i+1]['cords'][0].y==last_y) || 
			 (Math.sqrt(Math.pow(new_paths[i+1]['cords'][0].x-last_x, 2) + Math.pow(new_paths[i+1]['cords'][0].y-last_y, 2))<=skip_pen_jump_shorter_than)) ) {
			// no need to pen_up(), the next penstroke starts on the same spot or is close enough
			skip_next_pen_down = true ;
		} else {
			output += "pen_up()\n" ;
		}
	}

	return output ;
}