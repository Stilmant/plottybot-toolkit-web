<div id="section_calibration">
	<h2><span class="fas fa-crosshairs"></span>&nbsp;&nbsp;<strong>Calibration</strong></h2><br/>
	<div id="section_calibration_selection">
		<table>
			<tr>
				<td style="width:33%; vertical-align:top;">
					<center><button id="calibrate_automatic" class="btn btn-lg btn-light" onMouseDown="calibrate_automatic()">Calibrate Automatically</button></center>
					<br/>
					PlottyBot will automatically find its edges, do this if you are drawing on an unrestricted surface.
				</td>
				<td style="width:33%; vertical-align:top;">
					<center><button id="calibrate_manually" class="btn btn-lg btn-light" onMouseDown="calibrate_manually()">Calibrate Manually</button></center>
					<br/>
					Lets you set the limits of the drawing area. Do this if you are drawing on a medium smaller than PlottyBot allows.
				</td>
				<td style="width:33%; vertical-align:top;">
					<center><button id="calibrate_origin" class="btn btn-lg btn-light" onMouseDown="calibrate_origin()">Set Origin</button></center>
					<br/>
					Move the head to the 0,0 position to reset that position.
				</td>
			</tr>
		</table>
	</div>
	<div id="section_calibration_automatic" style="display:none">
		<center><img src="loading.gif"/></center>
	</div>
	<div id="section_calibration_manual" style="display:none">
		<center>
			<div id="section_calibration_manual_instructions">
			</div>
			<br/>
			<button class="btn btn-lg btn-light" id="calibrate_manually_fixate_down" onMouseDown="calibrate_manually_fixate_down()">head is at the lower edge</button>
			<button class="btn btn-lg btn-light" id="calibrate_manually_fixate_up" onMouseDown="calibrate_manually_fixate_up()">head is at the upper edge</button>
			<button class="btn btn-lg btn-light" id="calibrate_manually_fixate_left" onMouseDown="calibrate_manually_fixate_left()">head is at the leftmost edge</button>
			<button class="btn btn-lg btn-light" id="calibrate_manually_fixate_right" onMouseDown="calibrate_manually_fixate_right()">head is at the rightmost edge</button>
			<br/>
		</center>
		<br/>
		<center><table>
			<tr><td></td><td><button class="btn btn-lg btn-light fas fa-arrow-up" onMouseDown="calibrate_manually_step_up()"/></button></td><td></td></tr>
			<tr><td><button class="btn btn-lg btn-light fas fa-arrow-left" onMouseDown="calibrate_manually_step_left()"/></button></td><td></td><td><button class="btn btn-lg btn-light fas fa-arrow-right" onMouseDown="calibrate_manually_step_right()"/></button></td></tr>
			<tr><td></td><td><button class="btn btn-lg btn-light fas fa-arrow-down" onMouseDown="calibrate_manually_step_down()"/></button></td><td></td></tr>
		</table></center>
	</div>
	<div id="section_calibration_pen_adjustment" style="display:none">
		<center>
			Adjust the pen height in all 4 corners to ensure maximum drawing consistency
			<br/><br/>
			<button class="btn btn-lg btn-light" onMouseDown="go_to_top_left_corner_clicked();" id="go_to_top_left_corner">Go To Top Left Corner</button>
			<button class="btn btn-lg btn-light" onMouseDown="go_to_top_right_corner_clicked();" id="go_to_top_right_corner">Go To Top Right Corner</button>
			<button class="btn btn-lg btn-light" onMouseDown="go_to_bottom_right_corner_clicked();" id="go_to_bottom_right_corner">Go To Bottom Right Corner</button>
			<button class="btn btn-lg btn-light" onMouseDown="go_to_bottom_left_corner_clicked();" id="go_to_bottom_left_corner">Go To Bottom Left Corner</button>
			<br/><br/>
			<button class="btn btn-lg btn-light" onMouseDown="pen_up()">Pen Up</button>
			<button class="btn btn-lg btn-light" onMouseDown="pen_down()">Pen Down</button>
			<br/><br/>
			<button class="btn btn-lg btn-light" onMouseDown="done_adjusting_pen_height()">Done Adjusting Pen Height</button>
		</center>
	</div>
	<div id="section_calibration_origin" style="display:none">
		<center>
			<div id="section_calibration_origin_instructions">
			</div>
			<br/>
			<center><table>
				<tr><td></td><td><button class="btn btn-lg btn-light fas fa-arrow-up" onMouseDown="calibrate_manually_step_up()"/></button></td><td></td></tr>
				<tr><td><button class="btn btn-lg btn-light fas fa-arrow-left" onMouseDown="calibrate_manually_step_left()"/></button></td><td></td><td><button class="btn btn-lg btn-light fas fa-arrow-right" onMouseDown="calibrate_manually_step_right()"/></button></td></tr>
				<tr><td></td><td><button class="btn btn-lg btn-light fas fa-arrow-down" onMouseDown="calibrate_manually_step_down()"/></button></td><td></td></tr>
			</table></center>
			<br/>
			<button class="btn btn-lg btn-light" onMouseDown="calibrate_origin_fixate()">Head is at the 0,0 axis position</button>
		</center>
	</div>
</div>