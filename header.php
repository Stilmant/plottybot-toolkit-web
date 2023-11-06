<!doctype html>
<html>
	<head>
        <title>PlottyBot</title>
		<meta charset="utf-8">
	    <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <style>
            @import url('https://fonts.googleapis.com/css2?family=Lato:wght@700&display=swap');
        </style> 

        <!-- bootsrap -->
        <link rel="stylesheet" href="bootstrap.min.css">
        <link rel="stylesheet" href="font-awesome.min.css">
        <script src="jquery.min.js"></script>
        <script src="popper.min.js"></script>
        <script src="bootstrap.min.js"></script>

        <!-- google icons -->
        <link rel="stylesheet" href="all.css">

        <!-- bootstrap-slider https://github.com/seiyria/bootstrap-slider -->
        <script src="bootstrap-slider.min.js"></script>
        <link rel="stylesheet" href="bootstrap-slider.min.css">

        <script src="javascript.js"></script>
		<script src="gcode_to_turtle.js"></script>
		<script src="draw_turtle_code.js"></script>
        <script src="handwriting_typewriter.js"></script>
        <script src="mechanics.js"></script>
        <script src="wifi.js"></script>
        <style>
            body {
                margin: 0px;
                padding: 0px ;
                overflow-x: hidden ;
                font-family: 'Lato', sans-serif;
            }
            input[type=checkbox] {
                transform: scale( 1.5 ) ;
            }

            #section_error {
                background-color: #ffc107 ;
                border-radius: 10px ;
                padding: 10px ;
                margin: 7px ;
                display: none ;
            }
            #section_calibration {
                background-color: #cfe8ef ;
                border-radius: 10px ;
                padding: 10px ;
                margin: 7px ;
            }
            #section_draw {
                background-color: #e2e2df ;
                border-radius: 10px ;
                padding: 10px ;
                margin: 7px ;
            }
            #section_pcode {
                background-color: #dbcdf0 ;
                border-radius: 10px ;
                padding: 10px ;
                margin: 7px ;
            }
            #section_gcode {
                background-color: #c6def1 ;
                border-radius: 10px ;
                padding: 10px ;
                margin: 7px ;
            }
            #section_handwriting_typewriter {
                background-color: #c9e4de ;
                border-radius: 10px ;
                padding: 10px ;
                margin: 7px ;
            }
            #section_mandalagaba {
                background-color: #f7d9c4 ;
                border-radius: 10px ;
                padding: 10px ;
                margin: 7px ;
            }
            #section_mechanics {
                background-color: #f7d9c4 ;
                border-radius: 10px ;
                padding: 10px ;
                margin: 7px ;
            }
        </style>
	</head>
	<body style="background-color:gray;" onLoad="body_loaded();">

        <nav class="navbar navbar-expand-md navbar-light bg-light navbar-fixed-top sticky-top">
            <div class="container-fluid">
                <a href="#" class="navbar-brand">PlottyBot</a>
                <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <div class="navbar-nav">
                        <a class="nav-item nav-link" href="#section_calibration">Calibration</a>
                        <a class="nav-item nav-link" href="#section_draw">Draw</a>
                        <a class="nav-item nav-link" href="#section_pcode">Plotter Code</a>
                        <a class="nav-item nav-link" href="#section_gcode">GCode</a>
                        <a class="nav-item nav-link" href="#section_handwriting_typewriter">Handwriting Typewriter</a>
                        <a class="nav-item nav-link" href="#section_mandalagaba">Mandalagaba</a>
                        <a class="nav-item nav-link" href="#section_mechanics">Mechanics</a>
                    </div>
                    <div class="navbar-nav ml-auto">
                        <a href="#" onClick="wifi_modal_launched();" class="nav-item nav-link" data-toggle="modal" data-target="#wifi_modal"><span class="fas fa-wifi"></span></a>
                    </div>
                </div>
            </div>
        </nav>
