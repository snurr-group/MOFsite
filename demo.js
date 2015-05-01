$(function() {
	windowHeight = $(window).height();
	function initializeJmol(str) {
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
   script: "zap; set antialiasDisplay;background white; load " + str + " {1 1 1}; set displayCellParameters false; set appendNew false; zoom 20; spacefill only;",       // script to run
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

initializeJmol('./MOFs/Kr5.cif');

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
	
	
	$("#probeCountVF").val('');
	$("#probeSizeVF").val('');
	$("#probeCountVOL").val('');
	$("#probeSizeVOL").val('');
	
	$("#radio5").click(function() {
		initializeJmol('./MOFs/Kr5.cif');
		boxSize = 5;
	});
	$("#radio10").click(function() {
		initializeJmol('./MOFs/Kr10.cif');
		boxSize = 10;
	});
	$("#radio15").click(function() {
		initializeJmol('./MOFs/Kr15.cif');
		boxSize = 15;
	});
	
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
				Jmol.script(jmolApplet0, 'set autobond off; delete B*; var q = "' + inlineString + '"; load APPEND "@q"; zoom 60; select boron; spacefill ' + probeDisplaySize + ';');
				flaggedProbeCount = 0;
				var upperBound = Math.ceil(probeNumber/500);
				var calcVF = (1-4/3*Math.PI*Math.pow(radius,3)/Math.pow(boxSize,3)).toFixed(3);
				for (i=0;i<upperBound;i++) {
					var start = 500*i;
					var end = 500*(i+1);
					worker.postMessage([coordinateArray.slice(start, end), molInfo, currentNumber, probeSize, [cellA, cellB, cellC], i, probeNumber, isTriclinic]);
					worker.onmessage = function(event) {
						response = event.data;
						overString = response[0];
						Jmol.script(jmolApplet0, 'select ' + overString + '; delete selected;');
						// hide overlapping probes
						done = response[1];
						flaggedProbeCount += (overString.match(/B/g) || []).length;
						if (done) {
							vFraction = (1-flaggedProbeCount/probeNumber).toFixed(3);
							$("#loaderGIF").hide();
							$("#addmeVF").append('The void fraction is ' + calcVF + '. <br/> The void fraction obtained through <br /> simulation is ' + vFraction + '.<br /><br />');
							worker.terminate();
							coordinates = '';
							coordArray = [];
						}
					}
				}
			}
			
		
		// end if void fraction calculations are requested (as opposed to surface area)
		////////////// FOR VOLUME
		if (mode == 'VOL') {
				var coordinates = '';
				var coordArray = [];
				for (i=1;i<=probeNumber;i++) {
					coordinates = getRandomCo(i);
					// updates coordinateArray as well
					inlineString+= ' B ' + coordinates + '\n';
				}
				Jmol.script(jmolApplet0, 'set autobond off; delete B*; var q = "' + inlineString + '"; load APPEND "@q"; zoom 60; select boron; spacefill ' + probeDisplaySize + ';');
				flaggedProbeCount = 0;
				var upperBound = Math.ceil(probeNumber/500);
				for (i=0;i<upperBound;i++) {
					var start = 500*i;
					var end = 500*(i+1);
					worker.postMessage([coordinateArray.slice(start, end), molInfo, currentNumber, probeSize, [cellA, cellB, cellC], i, probeNumber, isTriclinic]);
					worker.onmessage = function(event) {
						response = event.data;
						overString = response[0];
						Jmol.script(jmolApplet0, 'select ' + overString + '; delete selected;');
						// hide overlapping probes
						done = response[1];
						flaggedProbeCount += (overString.match(/B/g) || []).length;
						if (done) {
							volumeCalc = flaggedProbeCount/probeNumber*Math.pow(boxSize,3);
							volumeCalc = volumeCalc.toFixed(3);
							$("#loaderGIF").hide();
							$("#addmeVOL").append('The volume 26.290 &#197;<sup>3</sup>. <br/> The volume obtained through <br /> simulation is ' + volumeCalc + ' &#197;<sup>3</sup>. <br /><br />');
							worker.terminate();
							coordinates = '';
							coordArray = [];
						}
					}
				}
			}
		// end for SAs
	}); // end for click on .run (submit) button

});
