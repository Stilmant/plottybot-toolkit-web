<div id="section_mechanics">
	<h2><span class="fas fa-wrench"></span>&nbsp;&nbsp;Mechanics</h2><br/>

	<div id="section_mandalagaba_disabled" class="alert alert-danger">
		<span class="fas fa-exclamation-triangle"></span>&nbsp;Tuning the configuration variables below can irreversibly damage your PlottyBot. Heck it might even hurt you. Don't do it unless you know exactly what you're doing.
		<div id="iknowwhatimdoing" style="padding:10px;"><center><button class="btn btn-danger" onClick="iknowwhatimdoing();">I know exactly what I'm doing</button></center></div>
	</div>

	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="default_step_sleep" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;default_step_sleep</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="acceleration_fast_steps_sleep" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;acceleration_fast_steps_sleep</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="acceleration_slow_steps_sleep" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;acceleration_slow_steps_sleep</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="acceleration_steps" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;acceleration_steps</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="deceleration_steps" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;deceleration_steps</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="pen_down_action_time" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;pen_down_action_time</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="pen_down_pulse_width" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;pen_down_pulse_width</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="pen_down_sleep_before_move_time" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;pen_down_sleep_before_move_time</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="pen_up_action_time" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;pen_up_action_time</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="pen_up_pulse_width" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;pen_up_pulse_width</div>
	<div class="form-inline"><input class="form-control iknowwhatimdoing" disabled type="text" id="pen_up_sleep_before_move_time" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;pen_up_sleep_before_move_time</div>
	<div class="form-inline"><input class="form-control" disabled type="text" id="microstepping" onKeyUp="delay_updated_variable(this.id);"/>&nbsp;microstepping</div>
	<div class="form-inline"><button class="btn btn-light iknowwhatimdoing" disabled onClick="test_bottom_stepper();">Test Bottom Stepper Motor</button></div>
	<div class="form-inline"><button class="btn btn-light iknowwhatimdoing" disabled onClick="test_top_stepper();">Test Top Stepper Motor</button></div>
	<div class="form-inline"><button class="btn btn-light iknowwhatimdoing" disabled onMouseDown="pen_up()">Pen Up</button></div>
	<div class="form-inline"><button class="btn btn-light iknowwhatimdoing" disabled onMouseDown="pen_down()">Pen Down</button></div>

	<span id="limit_switch_bottom_on" class="badge badge-light">Limit Switch Bottom</span>
	<span id="limit_switch_top_on" class="badge badge-light">Limit Switch Top</span>
	<span id="limit_switch_left_on" class="badge badge-light">Limit Switch Left</span>
	<span id="limit_switch_right_on" class="badge badge-light">Limit Switch Right</span>
	

	<div class="form-inline">
		<div class="form-check">
		    <input type="checkbox" class="form-check-input" id="consistent_approach_routine" disabled>
		    <label class="form-check-label" for="consistent_approach_routine">enable consistent approach routine (will always approach a "pen down" point with the same motion to alleviate belt tension inaccuracies).</label>
	  	</div>
	</div>

	<button class="btn btn-light iknowwhatimdoing" disabled onClick="mechanics_reset_to_defaults();">Reset to Defaults</button>
</div>