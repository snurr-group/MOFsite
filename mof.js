$(function() {
	windowHeight = $(window).height();
	// layout
	// VARIABLES
	// SCRIPT/FUNCTIONS
	// NAVIGATION		
	// global variables	
	var loaded = true;
	var userLoaded = false;
	var isTriclinic = false;
	var cellMatrix = [];
	var inverseMatrix = [];
	var t = '';
	var name = '';
	var cellA = 0;
	var cellB = 0;
	var cellC = 0;
	var probeNumber = 0;
	var currentNumber = 0;
	var angle = [];
	var side = [];
	// non-orthorhombic lattice vectors
	var vectA = [];
	var vectB = [];
	var vectC = [];
	var cellVol = 0;
	var mass = 0;
	var density = 0;
	var channelString = '';
	var loadedName = '';
	var channelStrings = {};
	var displayType = 'spacefill 23%; wireframe 0.15;'; // used to preserve display type when a file is uploaded
	var channelDisplay = false;
	var fileRequested = false;
	var superCellDisplay = false;
	var xyzFile ='';
	
	clearAll(); // needed?
	
	
	//////////////////////////////////////
	// LOAD MOF structure
	/////////////////////////////////////
	
	showMOF();
	
	function showMOF() {
		name = "DOTSOV";
		// name of initial load, subsequently name of loaded file
		preloadedMOF = window.location.hash.substring(1);
		var mofNameArray = ["DOTSOV", "KOJZAL", "MEHMET", "MIBQAR", "VUJBEI"];
		if (isInArray(preloadedMOF, mofNameArray)) { 
		var nameString = "./MOFs/" + preloadedMOF + ".cif"; // nameString not used elsewhere, consolidate this
		isTriclinic = false; 
		$.getJSON("unitcells.json", function(data) {
			unitcells = data;
			unitCellInfo = unitcells[preloadedMOF];
			side = [+unitCellInfo["a"], +unitCellInfo["b"], +unitCellInfo["c"]];
			console.log(side);
			angle = [unitCellInfo["alpha"], unitCellInfo["beta"], unitCellInfo["gamma"]];
			displayUnitcellInfo(side,angle);
			vectorCalculations(side,angle);
		});
		}
		else {
			nameString = "./MOFs/DOTSOV.cif";
		}
		// path to loaded file
		initializeJmol(nameString);
		// get JSON files which act as hashtables for MOF generation
		$.getJSON("MOF-database.json", function(data) {
			MOFdata = data;
		});
		$.getJSON("atomMasses.json", function(data) {
			masses = data;
		});
	} // end showMOF()
	
	
	function initializeJmol(str) {
		var f = '"%FILE"';
		// JSmol config
		var Info = {
			//color: "#FFFFFF", // white background (note this changes legacy default which was black)
			height: windowHeight,      // pixels (but it may be in percent, like "100%")
			width: "100%",
			  use: "HTML5",     // "HTML5" or "Java" (case-insensitive)
			j2sPath: "./jsmol/j2s",          // only used in the HTML5 modality
			jarPath: "java",               // only used in the Java modality
			jarFile: "JmolApplet0.jar",    // only used in the Java modality
			isSigned: false,               // only used in the Java modality
			serverURL: "php/jsmol.php",  // this is not applied by default; you should set this value explicitly
			// src: initialMOF,          // file to load
			//script: "set antialiasDisplay;background white; load " + str + "; set appendNew false; set defaultDropScript 'zap; load ASYNC " + f + "; console; var r = " + f + "; print r; spacefill only;'; zoom 60; spacefill only;",       // script to run
			script: "set antialiasDisplay; load " + str + " {1 1 1}; rotate y 30; rotate x 30; set appendNew false; set defaultDropScript '';  set displayCellParameters false; zoom 40; spacefill 23%; wireframe 0.15; background image './Images/gradBlue2.png';",       // script to run
			defaultModel: "",   // name or id of a model to be retrieved from a database
			addSelectionOptions: false,  // to interface with databases
			debug: false
		};
		// adjust z-index to behind all other elements (see css)
		Info.z = {
			header: 2,
			  rear: 3,
			  main: 3,
			  image: 3,
			  front: 3,
			  fileOpener: 3,
			  coverImage: 3,
			  dialog: 3,
			  menu: 3,
			  console: 2,
			  monitorZIndex: 3
		};
		// hardcoded DOTSOV cell matrix
		cellMatrix = [26.2833, 0, 0, 1.6093879608014814e-15, 26.2833, 0, 1.6093879608014814e-15, 1.6093879608014816e-15, 26.2833];
		inverseMatrix = inverse3x3(cellMatrix);
		// JSmol Applet
		var myJmol = Jmol.getAppletHtml("jmolApplet0", Info);
		$("#viewer")
		  .append(myJmol)
		  .addClass("padded");
		  
		  //mass = 9677.7 Da 
		  density = 0.885;
		$("#unitcellInfo").html('density = 0.885 g/cm<sup>3</sup> <br /> a = 26.283 &#197; <br /> b = 26.283 &#197; <br /> c = 26.283 &#197; <br /> &#945; = 90.000&#176; <br /> &#946; = 90.000&#176; <br /> &#947; = 90.000&#176;');   
	}
	/////////////////////////////////
	// end initializeJmol
	/////////////////////////////////
	
	
	/////////////////////////////////////////
	/////// UPLOAD FILE FROM DIALOGUE OR DARG & DROP
	/////////////////////////////////////////
	
		// drag and drop controls
	var obj = $("#uploadBox"); 
	
	obj.on('drop', function (e) {
		e.preventDefault();
		var files = e.originalEvent.dataTransfer.files;
		for (var i = 0, f; f = files[i]; i++) {
			var reader = new FileReader();
			reader.onload = (function(theFile) {
				if (theFile.name.split('.').pop().toLowerCase() != 'cif') {
					$("#notCIF").html('Not an accepted file type.');
				}
				else {
					$("#notCIF").html('');
				return function(e) {
					
					t = e.target.result;
					
					name = t;
					userLoaded = true;					
					
					console.log(unitCellDisplay);
					
					if (unitCellDisplay) {
						Jmol.script(jmolApplet0, 'var t = "' + t + '"; load "@t" {1 1 1};' + displayType + 'zoom 40; rotate x 30; rotate y 30;');
					}
					else {
						Jmol.script(jmolApplet0, 'var t = "' + t + '"; load "@t";' + displayType + 'zoom 40; rotate x 30; rotate y 30; boundbox off; unitcell off; axes off;');
					}
					var c  = Jmol.getPropertyAsArray(jmolApplet0, "boundBoxInfo");
					// used for corner locations
					cellMatrix = computeCellMatrix(t); // also updates isTriclinc
					inverseMatrix = inverse3x3(cellMatrix);
					loaded = true;
					userLoaded = true;
					$("#boxText").hide();
					$("#boxRadio").hide();
					//Jmol.script(jmolApplet0, 'spacefill only;');
				}
				};
			}
			)(f);
			reader.readAsText(f);
		}
		
	});
	
	// needed to prevent browser from opening dropped files
	$(document).on('dragenter', function (e) {
		e.stopPropagation();
		e.preventDefault();
	});
	$(document).on('dragover', function (e) {
		e.stopPropagation();
		e.preventDefault();
	});
	$(document).on('drop', function (e) {
		e.stopPropagation();
		e.preventDefault();
	});
	// end drop
	
	// once a file is uploaded, perform unit cell calculations, generate cell matrix (with inverse)		
	function handleFileSelect(evt) {
		var files = evt.target.files;		
		// FileList object
		// files is a FileList of File objects. List some properties.
		var output = [];
		for (var i = 0, f; f = files[i]; i++) {
			var reader = new FileReader();
			// Closure to capture the file information.
			reader.onload = (function(theFile) {
				if (theFile.name.split('.').pop().toLowerCase() != 'cif') {
							$("#notCIF").html('not an accepted file type.');
				}
				else {
					$("#notCIF").html('');
				return function(e) {
					t = e.target.result;
					Jmol.script(jmolApplet0, 'var t = "' + t + '"; load "@t"; zoom 40; rotate x 30; rotate y 30;' + displayType);
					if (unitCellDisplay) {
						Jmol.script(jmolApplet0, 'unitcell on;  boundbox on;');
					}
					else {
						Jmol.script(jmolApplet0, 'unitcell off; axes off; boundbox off;');
					}
					
					var c  = Jmol.getPropertyAsArray(jmolApplet0, "boundBoxInfo");
					// used for corner locations
					cellMatrix = computeCellMatrix(t);
					// also updates isTriclinc
					inverseMatrix = inverse3x3(cellMatrix);
					userLoaded = true;
					loaded = true;
					$("#boxText").hide(); // needed?
					$("#boxRadio").hide(); // needed?
				}
				};
			}
			)(f);
			// Read 
			reader.readAsText(f);
		}
	}
	// end function file select
	document.getElementById('files').addEventListener('change', handleFileSelect, false);
	
////////////////////
//// END FILE UPLOAD
///////////////////	
	
	
	
	////////////////////////////////////////
	//// DISPLAY PARAMETERS
	////////////////////////////////////////	
	// x1, y1, z1 checked by default
	$('input:radio[name="x"]').filter('[value="1"]').prop('checked', true);
	$('input:radio[name="y"]').filter('[value="1"]').prop('checked', true);
	$('input:radio[name="z"]').filter('[value="1"]').prop('checked', true);
	
	//
	$('input:radio[name="structureDisplay"]').filter('[value="Structure"]').prop('checked', true);
	$("input[name='structureDisplay']").change(function(){
		if($(this).val() == "Channels") { 
			showChannels();
		}
		else {
			showStructure();
		}
	});
	
	$('input:radio[name="atomsDisplay"]').filter('[value="BallStick"]').prop('checked', true);
	$('input:radio[name="atomsDisplay"]').change(function() {
			if ($(this).val() == "Spacefill") {
				displayType = 'spacefill only';
				Jmol.script(jmolApplet0,'select *; set autobond on; cartoons off; spacefill only;');
			}
			if ($(this).val() == "BallStick") {
				displayType = 'spacefill 23%; wireframe 0.15';
				Jmol.script(jmolApplet0,'select *; set autobond on; cartoons off; spacefill 23%; wireframe 0.15;');
			}
			if ($(this).val() == "Wireframe") {
				displayType = 'wireframe -0.1';
				Jmol.script(jmolApplet0,'select *; set autobond on; cartoons off; wireframe -0.1;');
			}
	});
	
	
	var unitCellDisplay = true;
	$('input:radio[name="unitCell"]').filter('[value="On"]').prop('checked', true);
	$('input:radio[name="unitCell"]').change(function() {
		if ($(this).val() == "On") {
			$("#unitcellInfo").show();
			unitCellDisplay = true;
			Jmol.script(jmolApplet0, 'unitcell on; boundbox on; ');
		}
		else {
			$("#unitcellInfo").hide();
			unitCellDisplay = false;
			Jmol.script(jmolApplet0, 'unitcell off; axes off; boundbox off;');
		}
	});	
		
	
	function displayUnitcellInfo(sides,angles) {
		for (i=0;i<sides.length;i++) {
			sides[i] = sides[i].toFixed(3);
			angles[i] = angles[i].toFixed(3);
		}
		
		var atomInfo = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo");
		
		$.getJSON("atomMasses.json", function(data) {
			masses = data;
			mass = 0;
			for (i=0;i<atomInfo.length;i++) {
				sym = atomInfo[i]['sym'];
				mass += +masses[sym];
			}
			mass = mass.toFixed(3);
			////
			//// This code is in the SA worker call, see if can make variable global and remove from there. 
			if (!isTriclinic) {
				cellVol = cellA*cellB*cellC;
			} else {
				cellVol = triclinicVol(vectA, vectB, vectC, angle);
			}
			////
			nA = 6.02*Math.pow(10,23);
			massGrams = mass/nA; // total mass in grams
			
			mass = parseFloat(mass);
			mass = mass.toFixed(1);
			
			density = massGrams / (cellVol * Math.pow(10,-24)); // density in g/cm3
			density = density.toFixed(3);
			$("#unitcellInfo").html('density = ' + density + ' g/cm<sup>3</sup> <br /> a = ' + sides[0] + ' &#197; <br /> b = ' + sides[1] + ' &#197; <br /> c = ' + sides[2] + ' &#197; <br /> &#945; = ' + angles[0] + '&#176; <br /> &#946; = ' + angles[1] + '&#176; <br /> &#947; = ' + angles[2] + '&#176;');   
		});
	} // end displayUnitCellInfo
	
	
	function loadSupercell(x,y,z) {
		if (userLoaded) {
			Jmol.script(jmolApplet0, 'var t = "' + t + '"; load "@t" {' + x + ' ' + y + ' ' + z + '}; zoom 60; rotate y 30; rotate x 30; set autobond on; spacefill 23%; wireframe 0.15;');
		} else {
			Jmol.script(jmolApplet0, 'load ./MOFs/' + name + '.cif {' + x + ' ' + y + ' ' + z + '}; zoom 60; rotate y 30; rotate x 30; set autobond on; spacefill 23%; wireframe 0.15;');
		}
		if (x != 1 || y != 1 || z != 1) {
			superCellDisplay = true;
		}
		else {
			superCellDisplay = false;
		}
	}
	function clearAll() {
		hashArray = [];
		$('input[name=count]').val('');
		$('input[name=size]').val('');
	}
	
	$("#infoBox").hide();
	$("#maker").hide();
	$("#MCContainer").hide();
	$("#supercellContainer").hide();
	$("#boxText").hide();
	$("#boxRadio").hide();

	
	$( "#accordion1" ).accordion( {
		collapsible: true,
		active: false,
		heightStyle: "content"
	});
	
	$( "#accordion2" ).accordion( {
		collapsible: true,
		active: false,
		heightStyle: "content"
	});

///////////////////////////////
///// END DISPLAY PARAMETERS
///////////////////////////////
	
	
	
	/////////////////////////////////
	//////// CHANNELS AND STRUCTURE 
	/////////////////////////////////
	
	
	function showStructure() {
		channelDisplay = false;
		$("#channelButtons").hide();
		$("#channelLoaderGIF").hide();
		$("#channelError").html('');
		$("#depthSliders").hide();
	}
	
	
	function showChannels() {
		$("#channelError").html('');
		$("#channelResolution").val('');
		$("#channelProbeSize").val('');
		$("#channelButtons").show();
	}
	

	function submitChannels() {
		var resolution = $("#channelResolution").val();
		var probeR = $("#channelProbeSize").val(); // this is the diameter, converted to radius in the worker call
		if (isNaN(resolution) || isNaN(probeR) || resolution < 0 || probeR < 0) {
			$("#channelError").html('Please enter positive numbers for the resolution and probe size');
		}
		else {
			//channelDisplay = true;
			$("#channelLoaderGIF").show();
			$("#channelError").html('');
		if (typeof(w) == "undefined") {
			var worker = new Worker("channel_worker.js");
		}

	//	if (channelStrings[loadedName] == null) {
		
		var fileInfo = Jmol.getPropertyAsArray(jmolApplet0, "fileInfo");
		if (!userLoaded) {
			cellA = fileInfo['models'][0]['_cell_length_a'];
			cellB = fileInfo['models'][0]['_cell_length_b'];
			cellC = fileInfo['models'][0]['_cell_length_c'];
		}
		channelString = '';
		var atomInfo = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo");
		worker.postMessage([atomInfo, isTriclinic, cellMatrix, inverseMatrix, [cellA, cellB, cellC], resolution, probeR]);
		worker.onmessage = function(event) {
			response = event.data;
			coords = response[0];
			
			xyzFile = response[1]; // global variable
			
			if (fileRequested) {
				var blob = new Blob([xyzFile], {type: "text/plain;charset=utf-8"});
				saveAs(blob, "structureChannels.xyz");
				fileRequested = false;
			}
			$("#channelLoaderGIF").hide();
			 worker.terminate(); 
		}
	}
}
	///////////////////////////////////
	////// END CHANNELS AND STRUCTURE
	///////////////////////////////////
	
	
	////////////////////////////////////////////////////////////////
	///// Submission of Physical Property Simulation, VF, SA, PSD
	////////////////////////////////////////////////////////////////
	
	$(".run").click(function() {
		
		// clear previous output
		$("#addmeSA").empty(); 
		$("#addmeVF").empty(); 
		$("#addmePSD").hide(); // has content - hide rather than empty
		$("#histogram").html(''); // can not empty because can not plot into a null space
		$("#histogram").hide(); 
		
		
		if (superCellDisplay) {
			if (userLoaded) {
				Jmol.script(jmolApplet0, 'var t = "' + t + '"; load "@t"; rotate y 30; rotate x 30; zoom 40; ' + displayType);
			}
			else {
				Jmol.script(jmolApplet0, 'load "./MOFs/DOTSOV.cif" {1 1 1}; rotate y 30; rotate x 30; zoom 40; ' + displayType);
			}
					if (unitCellDisplay) {
						Jmol.script(jmolApplet0, 'unitcell on;  boundbox on;');
					}
					else {
						Jmol.script(jmolApplet0, 'unitcell off; axes off; boundbox off;');
					}
			// return radios to show x1, y1, z1		
			$('input:radio[name="x"]').filter('[value="1"]').prop('checked', true);
			$('input:radio[name="y"]').filter('[value="1"]').prop('checked', true);
			$('input:radio[name="z"]').filter('[value="1"]').prop('checked', true);		
		}
		
		var mode = $(this).attr('id'); // read what kind of data is being requested based on which submit button is clicked
		
		switch (mode) {
			case 'VF':
				probeNumber = $("#probeCountVF").val();
				probeSize = $("#probeSizeVF").val();
			break;
			case 'SA' : 
				probeNumber = $("#probeCountSA").val();
				probeSize = $("#probeSizeSA").val();
			break;
			case 'PSD' : 
				probeNumber = $("#probeCountPSD").val();
				probeSize = $("#probeSizePSD").val();
			break;
		};

		// error testing needed
		if (isNaN(probeSize) || isNaN(probeNumber)) {
			$("#histogram").hide(); // hide the blank space
			idString = '#addme' + mode;
			$(idString).append('Please enter a valid number for the probe quantity and size. <br /><br />');
			return;
		} else {
			probeSize = +probeSize; // convert string to number
			var inlineString = probeNumber.toString() + "\n" + "Probes\n";
			$("#loaderGIF").show();
		}
		
		Jmol.script(jmolApplet0, 'select boron; spacefill 0;'); // hide all boron, try delete instead?
	
		var overString = '';
		
		
		var modelInfo = Jmol.getPropertyAsArray(jmolApplet0, "fileInfo");
		if (!userLoaded) {
			cellA = modelInfo['models'][0]['_cell_length_a'];
			cellB = modelInfo['models'][0]['_cell_length_b'];
			cellC = modelInfo['models'][0]['_cell_length_c'];
		}
		
		currentNumber = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo").length;
		
		var probeDisplaySize = probeSize;
		if (probeDisplaySize < 0.1) {
			probeDisplaySize = 0.1;
		}
		if (probeDisplaySize == 1.0) {
			// error with precisely 1 as input for "spacefill" Jmol function 
			probeDisplaySize = 1.001;
		}
		
		
		var molInfo = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo");
		var adjustment = 0;
		var done = false;
		
		////////////////// For VOID FRACTION AND PORE SIZE DISTRIBUTION 
		/////// Calculate randomly distributed coordinates
		if (mode == 'VF' || mode == 'PSD') {
			function tricFunc() {
				for (i=1;i<=probeNumber;i++) {
					var xx = Math.random();
					var yy = Math.random();
					var zz = Math.random();
					var ve = [xx, yy, zz];
					randCoord = matrixDotVector(cellMatrix,ve);
					randCoord[0] = randCoord[0].toFixed(4);
					randCoord[1] = randCoord[1].toFixed(4);
					randCoord[2] = randCoord[2].toFixed(4);
					coordinateArray[i-1] = randCoord;
				}
				loaded = false;
			}
			
			var coordinateArray = [];
			function getRandomCo(p) {
		var rX = (Math.random() * cellA).toFixed(5);
		var rY = (Math.random() * cellB).toFixed(5);
		var rZ = (Math.random() * cellC).toFixed(5);
		var coords = rX + ' ' + rY + ' ' + rZ;
		coordinateArray[p-1] = [rX, rY, rZ];
		return coords;
	}
			
			
			if (!isTriclinic) {
				var coordinates = '';
				var coordArray = [];
							for (i=1;i<=probeNumber;i++) {
					coordinates = getRandomCo(i);
					// updates coordinateArray as well
				}
			} else {
				tricFunc();
			}
		} 
		//////////////////// END if VF or PSD
		
		
			if (mode == 'VF') {
				$("#addmeVF").empty();
				if (typeof(w) == "undefined") {
				var worker = new Worker("overlap_worker.js");
				}
				flaggedProbeCount = 0;
				var vfIncrement = 10;
				var upperBound = Math.ceil(probeNumber/vfIncrement); 
				var prog = 0;
				$(".meter").show();
				$("#progressBar").css("width", prog);
				for (i=0;i<upperBound;i++) {
					var start = vfIncrement*i;
					var end = vfIncrement*(i+1);
					worker.postMessage([coordinateArray.slice(start, end), molInfo, currentNumber, probeSize/2, [cellA, cellB, cellC], i, probeNumber, isTriclinic, cellMatrix, inverseMatrix]);
					worker.onmessage = function(event) {
						
						response = event.data;
						overString = response[0];
						
						pIndex = response[2];
						prog = (100/(upperBound)*(pIndex+1)).toString() + '%';
						$("#progressBar").css("width", prog);
					
						//~ Jmol.script(jmolApplet0, 'select ' + overString + '; delete selected;');
						// hide overlapping probes
						done = response[1];
						flaggedProbeCount += (overString.match(/B/g) || []).length;
						if (done) {
							//$("#addme").append('<br /><br />' + probeNumber + ' probes used, ' + flaggedProbeCount + ' probes overlapped with the given structure.');	
							vFraction = (1-flaggedProbeCount/probeNumber).toFixed(3);
							$(".meter").hide();
							vVolume = (1/density*vFraction).toFixed(3);
							$("#addmeVF").append('The void fraction is ' + vFraction + '.<br /> The void volume is ' + vVolume +' cm<sup>3</sup>/g.<br /><br /> ');
							worker.terminate();
						}
					}
					
				}
			}
			// worker call for VF
			if (mode == 'PSD') {
				if (typeof(w) == "undefined") {
				var worker = new Worker("poresize_worker.js");
			}
				var prog = 0;
				$(".meter").show();
				$("#progressBar").css("width", prog);
				worker.postMessage([molInfo, probeNumber, [cellA, cellB, cellC], isTriclinic, inverseMatrix,coordinateArray.slice(start, end), cellMatrix, probeSize]);
				worker.onmessage = function(event) {
					response = event.data;
					psdDone = response[0];
					
					if (!psdDone) {
						pIndex = response[1];
						prog = (100/(probeNumber)*(pIndex+1)).toString() + '%';
						$("#progressBar").css("width", prog);
					}
					else {
					histArray = response[1];
					stepSize = response[2];
					rawDataString = response[3];
					$(".meter").hide();
					generateHistogram(histArray, probeSize, stepSize, rawDataString);
					$("#addmePSD").show();
					worker.terminate();
					}
				}
			}
			// end if PSD, worker call
		
		// end if void fraction calculations are requested (as opposed to surface area)
		////////////// FOR SURFACE AREA 
		if (mode == 'SA') {
			var workerSA = new Worker("surface_worker.js");
			if (!isTriclinic) {
				cellVol = cellA*cellB*cellC;
			} else {
				cellVol = triclinicVol(vectA, vectB, vectC, angle);
			}
			var prog = 0;
			$(".meter").show();
			$("#progressBar").css("width", prog);
			
			var surfaceArea = 0;
			$("#addmeSA").empty();
			for (j=0;j<currentNumber;j++) {
				workerSA.postMessage([probeNumber, j, molInfo, probeSize, [cellA, cellB, cellC], isTriclinic, cellMatrix, inverseMatrix, masses]);
				workerSA.onmessage = function(event) {
					surfaceArea +=event.data[0];
					done = event.data[1];
					pIndex = event.data[3];
					prog = (100/(currentNumber)*(pIndex+1)).toString() + '%';
					$("#progressBar").css("width", prog);
						if (done) {
							mass = event.data[2];
							surfaceAreaV = surfaceArea * 10000 / cellVol;
							surfaceAreaG = surfaceArea * Math.pow(10,-20) * 1/mass;	
							$(".meter").hide();
							$("#addmeSA").append('The surface area is ' + surfaceAreaV.toFixed(2) + ' m<sup>2</sup>/cm<sup>3</sup> or ' + surfaceAreaG.toFixed(2) + ' m<sup>2</sup>/g. <br /><br />');
							workerSA.terminate();
					}
				}
			}
		}
		// end for SAs
	}); // end for click on .run (submit) button
	
	
	
	///////////////////////////////////
	///// END SUBMISSION CALCULATIONS
	///////////////////////////////////
	
	//////////////////////
	//// PSD HISTOGRAM
	//////////////////////
	
	function generateHistogram(rawData, minSize, stepSize, dataStr) {
		var upper =  0 + (rawData.indexOf(0) + 2)*stepSize;
		histOptions = {
			yaxis: {
				max: 1,
				axisLabel: 'Relative abundance',
            axisLabelUseCanvas: false,
            //axisLabelFontSizePixels: 20,
			}
			, xaxis : {
				max: probeSize,
				axisLabel: 'Pore Diameter (&#197;)',
            axisLabelUseCanvas: false,
            axisLabelFontSizePixels: 20,
			}
		}
		;
		var data = [];
		var xval = 0;
		var yval = 0;
		var tmp = 0;
		for (i=0;i<rawData.length;i++) {
			xval = i*stepSize;
			if (i!=0 && i+1 < rawData.length) {
				yval = -1*(rawData[i+1] - rawData[i-1])/2*stepSize;
			}
			if (i==0) {
				yval = -1*(rawData[i+1] - rawData[i])/2*stepSize;
			}
			if (i+1 == rawData.length) {
				yval = -1*(rawData[i] - rawData[i-1])/2*stepSize;
			}
			if (tmp < yval) {
				tmp = yval;
			}
			data[i] = [xval, yval];
		}
		for (j=0;j<rawData.length;j++) {
			data[j][1] = data[j][1]/tmp;
			// normalize
		}
		var maxVal = Math.max.apply(null,data);
		var dataset = [{data: data, color: "#5482FF" }];
		$("#histogramContainer").show();
		$("#histogramContainer").draggable();
		$("#histogram").show();
		$.plot($('#histogram'), dataset, histOptions);
		$("#psdGraphLink").click(function() {
			$("#histogramContainer").show();
			$("#histogram").show();			
		});	
		$("#psdDataLink").click(function() {
			var blob = new Blob([dataStr], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "PoreSizeDistribution.txt");
		});	
	} // end generateHistogram()
	
	///////////////////////////////
	////// END HISTOGRAM
	///////////////////////////////
	
	
	
	////////////////////////
	//// BUTTONS
	////////////////////////
	
	$("#clearSA").click(function() {
		$("#probeCountSA").val('');
		$("#probeSizeSA").val('');
		$("#addmeSA").empty();
	});
	$("#clearVF").click(function() {
		Jmol.script(jmolApplet0, 'select boron; delete selected;');
		$("#probeCountVF").val('');
		$("#probeSizeVF").val('');
		$("#addmeVF").empty();
	});
	$("#clearPSD").click(function() {
		$("#probeCountPSD").val('');
		$("#probeSizePSD").val('');
		$("#histogram").empty();
		$("#histogram").css({height: "0px"});
		$("#addmePSD").empty();
	});
	
	
	$("#closePopup").click(function() {
		$("#histogramContainer").hide();
		$("#histogram").hide();
	});
	
	$("#closeLMPopupChannel").click(function() {
		$("#learnMorePopupChannel").hide();
	});
	$("#closeLMPopupVF").click(function() {
		$("#learnMorePopupVF").hide();
	});
	$("#closeLMPopupSA").click(function() {
		$("#learnMorePopupSA").hide();
	});
	$("#closeLMPopupPSD").click(function() {
		$("#learnMorePopupPSD").hide();
	});
		
	$("#learnVF").click(function() {
		$("#learnMorePopupVF")
		.show()
		.draggable();
	});
	$("#learnSA").click(function() {
		$("#learnMorePopupSA")
		.show()
		.draggable();
	});
	$("#learnPSD").click(function() {
		$("#learnMorePopupPSD")
		.show()
		.draggable();
	});

	$("#learnChannel").click(function() {
		$("#learnMorePopupChannel")
		.show()
		.draggable();
	});
	$("#saveChannel").click(function() {
			fileRequested = true;
			submitChannels();		
	});
	
	$("#submitSupercell").click(function() {
		var x = $('input[name=x]:checked').val();
		var y = $('input[name=y]:checked').val();
		var z = $('input[name=z]:checked').val();
		loadSupercell(x, y, z);
	});
	
	
	////////////////////////
	//// END BUTTONS
	////////////////////////
	
	
	////////////////////////
	//// MATH
	////////////////////////
	function triclinicVol(a,b,c,angles) {
		// angles in radians
		alpha = angles[0]*Math.PI/180;
		beta = angles[1]*Math.PI/180;
		gamma = angles[2]*Math.PI/180;
		v = vectMag(a)*vectMag(b)*vectMag(c)*Math.sqrt(1-Math.pow(Math.cos(alpha),2) - Math.pow(Math.cos(beta),2) - Math.pow(Math.cos(gamma),2) + 2*Math.cos(alpha)*Math.cos(beta)*Math.cos(gamma));
		//~ crossAB = vectorCross(a,b);
		//~ tripleProd = vectorDot(c,crossAB);
		return Math.abs(v);
	}
	function polarVect(r,t,p) {
		return [r*Math.sin(p)*Math.cos(t), r*Math.sin(p)*Math.sin(t), r*Math.cos(p)];
	}
	// matrix inverse
	function inverse3x3(matrix) {
		a = matrix[0];
		b = matrix[1];
		c = matrix[2];
		d = matrix[3];
		e = matrix[4];
		f = matrix[5];
		g = matrix[6];
		h = matrix[7];
		i = matrix[8];
		det = a*e*i+b*f*g+c*d*h-(c*e*g+b*d*i+a*f*h);
		mat = [(e*i-f*h), -(b*i-c*h), (b*f-c*e), -(d*i-f*g), (a*i-c*g), -(a*f-c*d), (d*h-e*g), -(a*h-b*g), (a*e-b*d)];
		for (i=0;i<mat.length;i++) {
			mat[i] *= 1/det;
		}
		return mat;
	}
	// magnitude of vector
	function vectMag(vector) {
		return Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2) + Math.pow(vector[2],2));
	}
	// vector dot product
	function vectorDot(ve1,ve2) {
		dot = 0;
		for (i=0;i<ve1.length;i++) {
			dot += ve1[i]*ve2[i];
		}
		return dot;
	}
	// vector cross product
	function vectorCross(v1,v2) {
		result = [];
		result[0] = v1[1]*v2[2]-v1[2]*v2[1];
		result[1] = v1[2]*v2[0]-v1[0]*v2[2];
		result[2] = v1[0]*v2[1]-v1[1]*v2[0];
		return result;
	}
	function matrixDotVector(m,v) {
		sX = m[0]*v[0] + m[3]*v[1] + m[6]*v[2];
		sY = m[1]*v[0] + m[4]*v[1] + m[7]*v[2];
		sZ = m[2]*v[0] + m[5]*v[1] + m[8]*v[2];
		return [sX, sY, sZ];
	}
	
	// compute the matrix that describes the unit cell based on the CIF file used
	function computeCellMatrix(t) {
		loadedName = t.split('\n')[0];
		//loadedNames[t.split('\n')[0]] = ''; // enter first line of file into object with no value
		angleIndices = [t.indexOf('_cell_angle_alpha'), t.indexOf('_cell_angle_beta'), t.indexOf('_cell_angle_gamma')];
		sideIndices = [t.indexOf('_cell_length_a'), t.indexOf('_cell_length_b'), t.indexOf('_cell_length_c')];
		angleSubstrings = [t.substring(angleIndices[0]), t.substring(angleIndices[1]), t.substring(angleIndices[2])];
		sideSubstrings = [t.substring(sideIndices[0]), t.substring(sideIndices[1]), t.substring(sideIndices[2])];
		//  angle (works for floats and ints)
		var floatExp = /\d+\.\d+/;
		var intExp = /\d+/;
		for (i=0;i<3;i++) {
			if (angleSubstrings[i].search(floatExp) <= angleSubstrings[0].search(intExp)) {
				angle[i] = +angleSubstrings[i].match(floatExp)[0];
			} else {
				angle[i] = +angleSubstrings[i].match(intExp)[0];
			}
			if (sideSubstrings[i].search(floatExp) <= sideSubstrings[0].search(intExp)) {
				side[i] = +sideSubstrings[i].match(floatExp)[0];
			} else {
				side[i] = +sideSubstrings[i].match(intExp)[0];
			}
		}
		if (angle[0] == angle[1] && angle[1] == angle[2] && side[0] == side[1] && side[1] == side[2]) {
			isTriclinic = false;
		} else {
			isTriclinic = true;
		}
		
		displayUnitcellInfo(side,angle);
		
		cellMatrix = vectorCalculations(side, angle);
		
		return cellMatrix;
	}
	
	function vectorCalculations(side, angle) {
		// an assumption is made at this point that vector (a) is parallel to the x-axis or (1,0,0)
		// (b) is in the xz-plane and (c) has a positive y component.
		// further, alpha is the angle (bc), beta is (ac), gamma is (ab)
		// if this is the case, then the vectors (a), (b), (c) may be calculated
		// using polar coordinates, theta = angle with (a), psi = angle with (b)
		// angle is now [alpha, beta, gamma]
		// side is [a, b, c]
		cellA = side[0];
		cellB = side[1];
		cellC = side[2];
		thetaA = 0;
		thetaB = angle[2]*Math.PI/180; // gamma
		thetaC = angle[1]*Math.PI/180; // beta
		
		psiA = angle[2]*Math.PI/180; // gamma
		psiB = 0;
		psiC = angle[0]*Math.PI/180; // alpha
		
		rA = side[0];
		rB = side[1];
		rC = side[2];
		
		vectA = polarVect(rA,thetaA,psiA);
		vectB = polarVect(rB,thetaB,psiB);
		vectC = polarVect(rC,thetaC,psiC);
		
		alpha = angle[0]*Math.PI/180;
		beta = angle[1]*Math.PI/180;
		gamma = angle[2]*Math.PI/180;
		
		A = cellA;
		B = cellB;
		C = cellC;
		
		a_x = A;
		a_y = 0.0;
		a_z = 0.0;
		b_x = B * Math.cos(gamma);
		b_y = B * Math.sin(gamma);
		b_z = 0.0;
		c_x = C * Math.cos(beta);
		c_y = (B * C * Math.cos(alpha) - b_x * c_x) / b_y;
		c_z = Math.sqrt(Math.pow(C,2) - Math.pow(c_x,2) - Math.pow(c_y,2));
		
		return [a_x, a_y, a_z, b_x, b_y, b_z, c_x, c_y, c_z];
	}
	
	///////////////////
	//// END MATH
	///////////////////
	
	
	// fix ajax json call 
	// allowing json object to be retrieved
	$.ajaxSetup( {
		beforeSend: function(xhr) {
			if (xhr.overrideMimeType) {
				xhr.overrideMimeType("application/json");
			}
		}
	}
	);
	function isInArray(value, arr) {
  return arr.indexOf(value) > -1;
}	
	////////////
});
