<?php

if( isset($_GET['action']) ) {
	if( $_GET['action']=="wifi_list" ) {
		$networks = array() ;

		$result = trim( shell_exec("sudo /usr/bin/list_ssids.sh") ) ;
		$result = explode( "Cell ", $result ) ;
		
		foreach( $result as $network ) {
			$network = explode( "\n", $network ) ;
			$parsed_network = array( 'essid'=>null,
									 'security'=>null,
									 'signal_strength'=>null ) ;
			foreach( $network as $line ) {
				if( substr_count($line, "ESSID:")>0 ) {
					$line = explode( ":", $line ) ;
					$line = $line[1] ;
					$line = str_replace( '"', "", trim($line) ) ;
					$parsed_network['essid'] = $line ;
				} else if( substr_count($line, "Signal level=")>0 ) {
					$line = explode( "=", $line ) ;
					$line = $line[2] ;
					$line = str_replace( '"', "", trim($line) ) ;
					$parsed_network['signal_strength'] = $line ;
				} else if( substr_count($line, "Encryption key:on")>0 ) {
					$parsed_network['security'] = true ;
				} else if( substr_count($line, "IEEE 802.11i/WPA2")>0 && $parsed_network['security']===true) {
					$parsed_network['security'] = "WPA2" ;
				}
			}
			if( $parsed_network['security']===null ) {
				$parsed_network['security'] = "OPEN" ;
			}
			if( $parsed_network['essid']!==null &&
			    $parsed_network['security']!==null &&
			    $parsed_network['signal_strength']!==null ) {
				$networks[] = $parsed_network ;
			}
		}

		echo json_encode( $networks ) ;
	} else if( $_GET['action']=="wifi_connect" &&
		 	   isset($_GET['essid']) &&
		 	   isset($_GET['security']) &&
		 	   isset($_GET['key']) ) {
		if( !file_exists("/data/wpa_supplicant.conf.bkp") ) {
			copy( "/etc/wpa_supplicant/wpa_supplicant.conf", "/data/wpa_supplicant.conf.bkp" ) ;
		}

		if( $_GET['security']=="WPA2" ) {
			$wpa_supplicant_wpa2_block = 'network={
	ssid="<ESSID>"
	psk="<KEY>"
	key_mgmt=WPA-PSK
}' ;
// 			$wpa_supplicant_wpa2_block = 'network={
//         ssid="<ESSID>"
//         psk="<KEY>"
//         proto=RSN
//         key_mgmt=WPA-PSK
//         pairwise=CCMP
//         auth_alg=OPEN
// }' ;
			
			$base = file_get_contents( "/data/wpa_supplicant.conf.bkp" ) ;
			$wpa_supplicant_wpa2_block = str_replace( "<ESSID>", urldecode($_GET['essid']), $wpa_supplicant_wpa2_block ) ;
			$wpa_supplicant_wpa2_block = str_replace( "<KEY>", urldecode($_GET['key']), $wpa_supplicant_wpa2_block ) ;
			$base .= "\n" . $wpa_supplicant_wpa2_block . "\n" ;
			file_put_contents( "/etc/wpa_supplicant/wpa_supplicant.conf", $base ) ;
			shell_exec( "sudo /sbin/reboot" ) ;
		} else if( $_GET['security']=="OPEN" ) {
			$wpa_supplicant_open_block = 'network={
    ssid="<ESSID>"
    scan_ssid=1
    key_mgmt=NONE
}' ;
			$base = file_get_contents( "/data/wpa_supplicant.conf.bkp" ) ;
			$wpa_supplicant_open_block = str_replace( "<ESSID>", urldecode($_GET['essid']), $wpa_supplicant_open_block ) ;
			$base .= "\n" . $wpa_supplicant_open_block . "\n" ;
			file_put_contents( "/etc/wpa_supplicant/wpa_supplicant.conf", $base ) ;
			shell_exec( "sudo /sbin/reboot" ) ;
		}
	}

	exit( 0 ) ;
}

?>

<div class="modal fade" id="wifi_modal" tabindex="-1" role="dialog" aria-labelledby="wifi_modal_label" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="wifi_modal_label">Wifi Setup</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" id="wifi_content">

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onClick="wifi_connect();">Connect</button>
      </div>
    </div>
  </div>
</div>