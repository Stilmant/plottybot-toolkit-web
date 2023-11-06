var wifi_done = false ;
var wifi_networks = null ;

function wifi_modal_launched() {
	document.getElementById( "wifi_content" ).innerHTML = 'Finding WiFi networks in range...<br/><br/><center><img src="loading.gif"/>' ;
	ajax_call( "wifi.php?action=wifi_list", [], function( data ) {
		document.getElementById( "wifi_content" ).innerHTML = "" ;
		wifi_networks = JSON.parse( data ) ;
		var best_signal_value = -10000 ;
		var new_html = "" ;
		for( var i=0 ; i<wifi_networks.length ; i++ ) {
			new_html += '<div class="form-check"><input class="form-check-input" type="radio" name="wifi_radios" onChange="wifi_key_enabled_or_disabled()" id="wifi_radio_'+i+'" value="'+i+'"' ;
			var signal = wifi_networks[i]['signal_strength'] ;
			signal = parseInt( signal.replace(" dBm", "") ) ;
			if( signal>best_signal_value ) {
				best_signal_value = signal ;
				new_html += ' checked' ;
			}
			new_html += '><label class="form-check-label" for="wifi_radio_'+i+'">' + wifi_networks[i]['essid'] + '</label></div>' ;
		}

		new_html += '<br/><div class="form-inline"><input class="form-control" disabled type="text" id="wifi_key"/>&nbsp;Wifi Key</div>' ;

		document.getElementById( "wifi_content" ).innerHTML = new_html ;
		wifi_key_enabled_or_disabled() ;
	} ) ;

}


function wifi_key_enabled_or_disabled() {
	var elements = document.getElementsByName( "wifi_radios" ) ;
	for( var i=0 ; i<elements.length ; i++ ) {
		if( elements[i].checked ) {
			var network_index = parseInt( elements[i].value ) ;
			if( wifi_networks[network_index]['security']=="WPA2" ) {
				enable( "wifi_key" ) ;
			} else {
				disable( "wifi_key" ) ;
			}
			break ;
		}
	}
}

function wifi_connect() {
	var elements = document.getElementsByName( "wifi_radios" ) ;
	for( var i=0 ; i<elements.length ; i++ ) {
		if( elements[i].checked ) {
			var network_index = parseInt( elements[i].value ) ;
			ajax_call( "wifi.php?action=wifi_connect&essid="+wifi_networks[network_index]['essid']+"&security="+wifi_networks[network_index]['security']+"&key="+document.getElementById('wifi_key').value, [], function( data ) {
				alert( "You will now be disconnected from Plotty bot. Please wait a minute, make sure you are joined to the same Wifi network as PlottyBot and point your browser to http://plottybot.local" ) ;
				setTimeout( function() { location.reload() ;}, 60000 ) ;
			} ) ;
			break ;
		}
	}
}