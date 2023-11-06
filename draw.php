<div id="section_draw">
	<h2><span class="fas fa-pencil-alt"></span>&nbsp;&nbsp;<strong>Draw</strong></h2><br/>

	<div id="section_draw_disabled" class="alert alert-warning">
		Some features in this section are disabled until PlottyBot is calibrated <span class="fas fa-crosshairs"></span>.
	</div>

	<center>
		<div>
			<table cellspacing="0" cellpadding="0">
				<tr><td><div class="small text-right" id="max_y">100</div></td><td></td></tr>
				<tr><td></td><td><canvas id="preview" style="background-color:white; width:200px; height:200px; border: 1px solid black;" width="200" height="200"></canvas></td><td></td></tr>
				<tr><td><div class="small text-right">0</div></td><td></td><td><div class="small text-right" id="max_x">100</div></td></tr>
			</table>
			<br/>
			<div id="draw_actuation" class="disabled">
				<button id="draw_button" class="needs_calibration btn btn-lg btn-light fas fa-play" onClick="draw()" disabled></button>
				<button id="pause_button" class="needs_calibration btn btn-lg btn-light fas fa-pause" onClick="pause()" disabled></button>
				<button id="stop_button" class="needs_calibration btn btn-lg btn-light fas fa-stop" onClick="stop()" disabled></button>
				<button class="btn btn-lg btn-light fas fa-redo" onClick="tcode_changed(10, 10);"></button>
			</div>
		</div>
	</center>
	<br/><br/>
	<div class="form-inline">
		<div class="form-check">
		    <input type="checkbox" class="form-check-input" id="ink_refill_routine_enabled" onChange="ink_refill_routine_enabled();">
		    <label class="form-check-label" for="ink_refill_routine_enabled">Ink Refill Routine</label>
	  	</div>
	</div>
	<div id="ink_refill_routine_parameters" style="display:none">
		<div class="form-inline">
			<textarea class="form-control" id="ink_refill_routine" placeholder="Plotter Code" onInput="ink_refill_routine_changed()"></textarea>
			&nbsp;<button class="needs_calibration btn btn-light" onMouseDown="test_ink_refill_routine()" disabled>Test Routine</button>
		</div>
		<div class="form-inline">
			<div class="form-check">
			    <input type="checkbox" class="form-check-input" id="ink_refill_every_penstroke" onChange="ink_refill_every_penstroke();" checked>
			    <label class="form-check-label" for="ink_refill_every_penstroke">Refill at every penstroke</label>
		  	</div>
		</div>
		<div class="form-inline">
			<div id="ink_refill_routine_parameters_refill_every_x" style="display:none">
				<input class="form-control" type="text" id="ink_refill_every_x" placeholder="Ink refill every X" onInput="ink_refill_every_x()"/> Refill every X distance travelled
			</div>
		</div>
	</div>
</div>
<div id="section_draw_overlay">
</div>