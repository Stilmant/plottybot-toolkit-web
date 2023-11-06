<div id="section_mandalagaba" class="disabled">
	<h2><span class="fas fa-star"></span>&nbsp;&nbsp;Mandalagaba</h2><br/>
	<?php /* TODO: what happens if plotter tries to join MG session that isn't already established? */ ?>

	<div id="section_mandalagaba_disabled" class="alert alert-warning">
		This section is disabled until PlottyBot is calibrated <span class="fas fa-crosshairs"></span> AND it is connected to the internet <span class="fas fa-wifi"></span>.
	</div>

	<div id="section_mandalagaba_enabled" style="display:none">
		To connect to an active MandalaGaba session, type in the Session Identifier (the part in the URL after the #) and click connect. The session has to be open in someone's web browser for it to be accessible.<br/><br/>
		#<input type="text" id="mg_session_id" placeholder="Session Identifier" size="15"/> <button id="mg_connect" class="btn btn-light" onMouseDown="connect_to_mg_session()">Connect</button><button id="mg_disconnect" class="btn btn-light"onMouseDown="disconnect_from_mg_session()" style="display:none;">Disconnect</button>
	</div>
</div>