<?php

if( isset($_POST['command']) ) {
    $command = $_POST['command'] ;
   
    if( $command=="go_to" && isset($_POST['data']) ) {
    	$data = json_decode( $_POST['data'], true ) ;
    	$command = "{$command}( {$data['x']}, {$data['y']} )" ;
    } else if( $command=="draw" && isset($_POST['data']) ) {
    	$tcode = json_decode( $_POST['data'], true ) ;
    	file_put_contents( "/data/tcode", $tcode ) ;
    } else if( $command=="update_ink_refill_routine" && isset($_POST['data']) ) {
        $ink_refill_routine = json_decode( $_POST['data'], true ) ;
        file_put_contents( "/data/ink_refill_routine", $ink_refill_routine ) ;
    } else if( $command=="connect_to_mg_session" && isset($_POST['session_id']) ) {
        $command = "{$command}( {$_POST['session_id']} )" ;
    } else if( $command=="ink_refill_routine_enabled" && isset($_POST['data']) ) {
        $string_boolean = "false" ;
        if( json_decode($_POST['data'])===true ) {
            $string_boolean = "true" ;
        }
        $command = "{$command}( {$string_boolean} )" ;
    } else if( $command=="ink_refill_every_penstroke" && isset($_POST['data']) ) {
        $string_boolean = "false" ;
        if( json_decode($_POST['data'])===true ) {
            $string_boolean = "true" ;
        }
        $command = "{$command}( {$string_boolean} )" ;
    } else if( $command=="ink_refill_every_x" && isset($_POST['data']) ) {
        $value = json_decode( $_POST['data'] ) ;
        $command = "{$command}( {$value} )" ;
    } else if( $command=="mechanics_update_variable" && isset($_POST['variable_name']) && isset($_POST['variable_value']) ) {
        $command = "{$_POST['variable_name']}( {$_POST['variable_value']} )" ;
    } else if( $command=="add_to_ht_penstrokes" && isset($_POST['data']) ) {
        $pcode = json_decode( $_POST['data'], true ) ;
        file_put_contents( "/data/add_to_ht_penstrokes", $pcode ) ;
    } else if( $command=="reset" ) {
        shell_exec( "/usr/bin/sudo /usr/local/sbin/reset.sh" ) ;
    } 

    // sending the schmilblick over
    $fp = fsockopen( "127.0.0.1", 1337, $errno, $errstr ) ;
    if( !$fp ) {
    	http_response_code( 501 ) ;
    	echo "couldn't connect to command server" ;
    	exit( 1 ) ;
    }
    fputs( $fp, $command ) ;
    $res = "" ;
    while( !feof($fp) ) { $res .= fgets($fp, 128) ; }
    fclose( $fp ) ;
    echo $res ;
}

?>
