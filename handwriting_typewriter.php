<div id="section_handwriting_typewriter">
	<h2><span class="fas fa-pen-fancy"></span>&nbsp;&nbsp;<strong>Handwritting Typewriter</strong></h2><br/>
	<script src="seedrandom.min.js"></script>
	Load a Flexible Font from file:
	<form id="myform" class="form-inline">
    	<input id="myfile" name="files[]" multiple="" type="file" class="btn btn-light form-control"/>
	</form>
	<br/>
	Save current Flexible Font to file: <button class="btn btn-light" onClick="downloadObjectAsJson(ffont, 'ffont');">Save</button>
	<br/><br/>
	<div>
		Work Area:<br/>
		<table>
			<tr><td colspan="3"><canvas id="work_canvas" style="background-color:#f3f3f3;"></canvas></td></tr>
			<tr>
				<td align="left">
					<a href="javascript:void(0);" onClick="start_line_left();">&lt;</a>
					<a href="javascript:void(0);" onClick="start_line_right();">&gt;</a>
					<a href="javascript:void(0);" onClick="place_start_dot_switch();">*</a>
				</td>
				<td align="center">
					<a href="javascript:void(0);" onClick="reset();">reset</a>
				</td>
				<td align="right">
					<a href="javascript:void(0);" onClick="place_end_dot_switch();">*</a>
					<a href="javascript:void(0);" onClick="end_line_left();">&lt;</a>
					<a href="javascript:void(0);" onClick="end_line_right();">&gt;</a>
				</td>
			</tr>
		</table>
		</span>
	</div>
	<br/><br/>
	<div>
		Character List:<br/>
		<input class="form-control" id="character_list" type="text" value="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}[]|\:&#34;;'&#60;&#62;?,./ " onKeyUp="sample_text_changed() ;"/>
	</div>
	<br/><br/>
	<div id="char_variation_table" style="max-width:100%; width:100%; overflow-x:scroll"></div>
	<br/><br/>
	<div>
		Text:<br/>
		<textarea class="form-control" rows="6" id="ht_text" placeholder="Type text to turn into Plotter Code here." onKeyUp="text_changed() ; ht_send_delta() ;"></textarea>
	</div>
	<br/>
	<div class="form-inline">
		0.1&nbsp;<input id="text_to_pcode_size_ratio" type="text" data-slider-min="0.1" data-slider-max="10" data-slider-step="0.1" data-slider-value="1" onChange="text_changed();"/>&nbsp;10.0&nbsp;&nbsp;&nbsp;&nbsp;Size Ratio
		<script>var slider = new Slider( "#text_to_pcode_size_ratio", {formatter: function(value) {return 'Current value: ' + value;}});</script>
	</div>
	<br/>
	<div class="form-inline">
		<div class="form-check">
		    <input type="checkbox" class="form-check-input" id="handwriting_typewriter_live_keyboard" onChange="handwriting_typewriter_live_keyboard();">
		    <label class="form-check-label" for="handwriting_typewriter_live_keyboard">Live Keyboard (instructions are sent to PlottyBot as you type)</label>
	  	</div>
	</div>
</div>