<div id="section_gcode">
	<h2><span class="fas fa-code"></span>&nbsp;&nbsp;<strong>GCode</strong></h2><br />
	<textarea class="form-control" id="gcode" placeholder="GCode" onInput="gcode_changed();" style="width:100%;" rows="12"></textarea>
	<br /><br />
	<div class="form-inline">
		<div class="form-check">
			<input type="checkbox" class="form-check-input" id="aggregation_algorithm_normalize" onChange="gcode_changed();" checked>
			<label class="form-check-label" for="aggregation_algorithm_normalize">Normalize</label>
		</div>
	</div>
	<div class="form-inline">
		Penstroke aggregation algorithm:
		<select class="form-control" id="aggregation_algorithm" onChange="gcode_changed();">
			<option value="none">as they come</option>
			<option value="next_closest">next closest</option>
			<option value="next_closest_allow_reverse" selected>next closest, consider start and end</option>
			<option value="polarized">polarized</option>
		</select>
	</div>
	<div class="form-inline" id="aggregation_algorithm_polarized_pole_coordinates" style="display:none;">
		Pole coordinates: (<input class="form-control" placeholder="x" id="aggregation_algorithm_polarized_x" size="3" value="0" onInput="clearTimeout(gcode_to_pcode_value_update_timeout_id);gcode_to_pcode_value_update_timeout_id=setTimeout(function(){gcode_changed();},1000);" />,<input class="form-control" placeholder="y" id="aggregation_algorithm_polarized_y" size="3" value="0" onInput="clearTimeout(aggregation_algorithm_polarized_timeout_id);aggregation_algorithm_polarized_timeout_id=setTimeout(function(){gcode_changed();},1000);" />)
	</div>
	<div class="form-inline">
		Skip pen jumps shorter than: <input class="form-control" placeholder="0" id="skip_pen_jumps_shorter_than_value" size="3" value="0.2" onInput="clearTimeout(gcode_to_pcode_value_update_timeout_id);gcode_to_pcode_value_update_timeout_id=setTimeout(function(){gcode_changed();},1000);" />
	</div>
	<br />
</div>