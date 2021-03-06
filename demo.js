$(function() {
	windowHeight = $(window).height();
	function initializeJmol(str, zoomSize) {
	// JSmol config
	 var Info = {
 color: "#FFFFFF", // white background (note this changes legacy default which was black)
   height: windowHeight,      // pixels (but it may be in percent, like "100%")
   width: "100%",
  use: "HTML5",     // "HTML5" or "Java" (case-insensitive)
   j2sPath: "./jsmol/j2s",          // only used in the HTML5 modality
   jarPath: "java",               // only used in the Java modality
   jarFile: "JmolApplet0.jar",    // only used in the Java modality
   isSigned: false,               // only used in the Java modality
   serverURL: "php/jsmol.php",  // this is not applied by default; you should set this value explicitly
  // src: initialMOF,          // file to load
   script: "zap; set antialiasDisplay;background white; load " + str + " {1 1 1}; rotate y 30; rotate x 30; set displayCellParameters false; set appendNew false; zoom " + zoomSize + "; spacefill only; background image './Images/gradBlue2.png';",       // script to run
   defaultModel: "",   // name or id of a model to be retrieved from a database
   addSelectionOptions: false,  // to interface with databases
   debug: false
 };	 

// adjust z-index to behind all other elements (see css)
Info.z = {
  header: 2,
  rear: 2,
  main: 2,
  image: 2,
  front: 2,
  fileOpener: 2,
  coverImage: 2,
  dialog: 2,
  menu: 2,
  console: 2,
  monitorZIndex: 2
};

// JSmol Applet
var myJmol = Jmol.getAppletHtml("jmolApplet0", Info);

  $("#viewer2")
  .html(myJmol)
  .addClass("padded");

} // end initializeJmol

initializeJmol('./MOFs/Kr5.cif', '20');

$( "#accordion1" ).accordion( {
		collapsible: true,
		      heightStyle: "content"
	});
	$( "#accordion2" ).accordion( {
		collapsible: true,
		      heightStyle: "content"
	});

$.getJSON("atomMasses.json", function(data) {
			masses = data;
		});
	
var coordinateArray = [];
var cellMatrix = [];
var inverseMatrix = [];
var isTriclinic = false;
var radius = 1.844605796;
var boxSize = 5;

	function getRandomCo(p) {
		var rX = (Math.random() * cellA).toFixed(5);
		var rY = (Math.random() * cellB).toFixed(5);
		var rZ = (Math.random() * cellC).toFixed(5);
		var coords = rX + ' ' + rY + ' ' + rZ;
		coordinateArray[p-1] = [rX, rY, rZ];
		return coords;
	}	
	
	$('input:radio[name="boxSize"]').filter('[value="5"]').prop('checked', true);
	$('input:radio[name="boxSize"]').filter('[value="10"]').prop('checked', false);
	$('input:radio[name="boxSize"]').filter('[value="15"]').prop('checked', false);
	
	$('input:radio[name="x"]').filter('[value="1"]').prop('checked', true);
	$('input:radio[name="y"]').filter('[value="1"]').prop('checked', true);
	$('input:radio[name="z"]').filter('[value="1"]').prop('checked', true);
	
	
	$("#probeCountVF").val('');
	$("#probeSizeVF").val('');
	$("#probeCountVOL").val('');
	$("#probeSizeVOL").val('');
	
	$("#radio5").click(function() {
		initializeJmol('./MOFs/Kr5.cif', '20');
		boxSize = 5;
	});
	$("#radio10").click(function() {
		initializeJmol('./MOFs/Kr10.cif', '15');
		boxSize = 10;
	});
	$("#radio15").click(function() {
		initializeJmol('./MOFs/Kr15.cif', '10');
		boxSize = 15;
	});
	
	$("#submitSupercell").click(function() {
		var x = $('input[name=x]:checked').val();
		var y = $('input[name=y]:checked').val();
		var z = $('input[name=z]:checked').val();
		loadSupercell(x, y, z);
	});
	/////////////////////////////////////////
	
	function loadSupercell(x,y,z) {
		
			Jmol.script(jmolApplet0, 'load ./MOFs/Kr' + boxSize + '.cif {' + x + ' ' + y + ' ' + z + '}; zoom 60; rotate y 30; rotate x 30; set autobond on; spacefill 23%; wireframe 0.15;');
		
		if (x != 1 || y != 1 || z != 1) {
			superCellDisplay = true;
		}
		else {
			superCellDisplay = false;
		}
	}
	
	//////////////////////////////////////////
	$(".run").click(function() {
		$("#loaderGIF").show();
		//	Jmol.script(jmolApplet0, 'zap; load ./MOFs/' + name + '.cif {1 1 1}; spacefill only;');
			$("#hideMOF").html('Hide Structure');
		
		transf  = Jmol.getPropertyAsArray(jmolApplet0, "boundBoxInfo");
		
		Jmol.script(jmolApplet0, 'select boron; spacefill 0;');
		$("#addmeVF").empty();
		$("#addmeVOL").empty();
		// clear previous output
		
		var overString = '';
	
		//~ if (superCellDisplay) {
			//~ if (userLoaded) {
				//~ Jmol.script(jmolApplet0, 'var t = "' + t + '"; load "@t"; rotate y 30; rotate x 30; zoom 40; ' + displayType);
			//~ }
			//~ else {
				//~ Jmol.script(jmolApplet0, 'load "./MOFs/DOTSOV.cif" {1 1 1}; rotate y 30; rotate x 30; zoom 40; ' + displayType);
			//~ }
					//~ if (unitCellDisplay) {
						//~ Jmol.script(jmolApplet0, 'unitcell on;  boundbox on;');
					//~ }
					//~ else {
						//~ Jmol.script(jmolApplet0, 'unitcell off; axes off; boundbox off;');
					//~ }
			//~ // return radios to show x1, y1, z1		
			//~ $('input:radio[name="x"]').filter('[value="1"]').prop('checked', true);
			//~ $('input:radio[name="y"]').filter('[value="1"]').prop('checked', true);
			//~ $('input:radio[name="z"]').filter('[value="1"]').prop('checked', true);		
		//~ }
	
		var mode = $(this).attr('id');
		switch (mode) {
			case 'VF':
			probeNumber = $("#probeCountVF").val();
			probeSize = $("#probeSizeVF").val();
			break;
			case 'VOL' : 
			probeNumber = $("#probeCountVOL").val();
			probeSize = $("#probeSizeVOL").val();
			break;
		}
		
		var modelInfo = Jmol.getPropertyAsArray(jmolApplet0, "fileInfo");
		
			cellA = modelInfo['models'][0]['_cell_length_a'];
			cellB = modelInfo['models'][0]['_cell_length_b'];
			cellC = modelInfo['models'][0]['_cell_length_c'];
		
		currentNumber = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo").length;
		
		var inlineString = probeNumber.toString() + "\n" + "Probes\n";
		if (isNaN(probeSize) || isNaN(probeNumber)) {
			idString = "#addme" +mode;
			$(idString).append('<br /> Please enter a valid number for the probe quantity and size.');
			return;
		} else {
			probeSize = +probeSize;
			// convert string to number
		}
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
			if (typeof(w) == "undefined") {
				var worker = new Worker("overlap_worker.js");
			}
							
			
			if (mode == 'VF') {
				var coordinates = '';
				var coordArray = [];
				for (i=1;i<=probeNumber;i++) {
					coordinates = getRandomCo(i);
					// updates coordinateArray as well
					inlineString+= ' B ' + coordinates + '\n';
				}
				if (probeDisplaySize >= 2) {
					probeDisplaySize = 1.9;
				}
				
				if (probeDisplaySize > (cellA -3.9)) {
					$("#addmeVF").append('The selected probe diameter is too large for meaningful results in the current unit cell. Please select a larger box size or smaller probe.'); 
				}
				else {
					Jmol.script(jmolApplet0, 'set autobond off; delete B*; var q = "' + inlineString + '"; load APPEND "@q"; zoom 20; select boron; spacefill ' + probeDisplaySize + ';');
				flaggedProbeCount = 0;
				var vfIncrement = 10;
				var upperBound = Math.ceil(probeNumber/vfIncrement); 
				var prog = 0;
				$(".meter").show();
				$("#progressBar").css("width", prog);
				var calcVF = (1-4/3*Math.PI*Math.pow(radius,3)/Math.pow(boxSize,3)).toFixed(3);
				for (i=0;i<upperBound;i++) {
					var start = vfIncrement*i;
					var end = vfIncrement*(i+1);
					worker.postMessage([coordinateArray.slice(start, end), molInfo, currentNumber, probeSize, [cellA, cellB, cellC], i, probeNumber, isTriclinic]);
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
							vFraction = (1-flaggedProbeCount/probeNumber).toFixed(3);
							$(".meter").hide();
							$("#addmeVF").append('The void fraction is ' + calcVF + '. <br/> The void fraction obtained through <br /> simulation is ' + vFraction + '.<br /><br />');
							worker.terminate();
							coordinates = '';
							coordArray = [];
						}
					}
				} // end for loop
			}// end else
			}
			
		
		// end if void fraction calculations are requested (as opposed to surface area)
		////////////// FOR VOLUME
		if (mode == 'VOL') {
			if (probeDisplaySize > (cellA -3.9)) {
					$("#addmeVF").append('The selected probe diameter is too large for meaningful results in the current unit cell. Please select a larger box size or smaller probe.'); 
				}
				else {
			
				var coordinates = '';
				var coordArray = [];
				for (i=1;i<=probeNumber;i++) {
					coordinates = getRandomCo(i);
					// updates coordinateArray as well
					inlineString+= ' B ' + coordinates + '\n';
				}
				Jmol.script(jmolApplet0, 'set autobond off; delete B*; var q = "' + inlineString + '"; load APPEND "@q"; zoom 20; select boron; spacefill ' + probeDisplaySize + ';');
				flaggedProbeCount = 0;
				var vfIncrement = 10;
				var upperBound = Math.ceil(probeNumber/vfIncrement); 
				var prog = 0;
				$(".meter").show();
				$("#progressBar").css("width", prog);
				for (i=0;i<upperBound;i++) {
					var start = vfIncrement*i;
					var end = vfIncrement*(i+1);
					worker.postMessage([coordinateArray.slice(start, end), molInfo, currentNumber, probeSize, [cellA, cellB, cellC], i, probeNumber, isTriclinic]);
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
							volumeCalc = flaggedProbeCount/probeNumber*Math.pow(boxSize,3);
							volumeCalc = volumeCalc.toFixed(3);
							volumeExact = Math.pow((3.6892/2 + probeSize),3)*Math.PI*4/3;
							volumeExact = volumeExact.toFixed(3);
							$(".meter").hide();
							$("#addmeVOL").append('The volume is ' + volumeExact + ' &#197;<sup>3</sup>. <br/> The volume obtained through <br /> simulation is ' + volumeCalc + ' &#197;<sup>3</sup>. <br /><br />');
							worker.terminate();
							coordinates = '';
							coordArray = [];
						}
					}
				}
			}
			}
		// end for SAs
	}); // end for click on .run (submit) button

});
