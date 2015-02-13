	$(function() {
	// VARIABLES 
	var name = "DOTSOV"; // name of initial load, subsequently name of loaded file
	var nameString = "./MOFs/" + name + ".cif"; // path to loaded file
	var cellA = 0;
	var cellB = 0;
	var cellC = 0;
	var probeNumber = 3000;
	var currentNumber = 0;
	var demo = false;

	// JSmol config
	 var Info = {
 color: "#FFFFFF", // white background (note this changes legacy default which was black)
   height: "120%",      // pixels (but it may be in percent, like "100%")
   width: "70%",
  use: "HTML5",     // "HTML5" or "Java" (case-insensitive)
   j2sPath: "./jsmol/j2s",          // only used in the HTML5 modality
   jarPath: "java",               // only used in the Java modality
   jarFile: "JmolApplet0.jar",    // only used in the Java modality
   isSigned: false,               // only used in the Java modality
   serverURL: "php/jsmol.php",  // this is not applied by default; you should set this value explicitly
  // src: initialMOF,          // file to load
   script: "set antialiasDisplay;background white; set appendNew false; load ./MOFs/DOTSOV.cif {1 1 1}; zoom 60; spacefill only;",       // script to run
   defaultModel: "",   // name or id of a model to be retrieved from a database
   addSelectionOptions: false,  // to interface with databases
   debug: false
 };	 

// JSmol Applet
var myJmol = Jmol.getAppletHtml("jmolApplet0", Info);

$(document).ready(function() {
  $("#viewer")
  .append(myJmol)
  .addClass("padded");
})



// define the web worker, overlap_worker.js which performs MC computations in the background

if (typeof(w) == "undefined") {
			var worker = new Worker("overlap_worker.js");
		}

// get JSON files which act as hashtables for MOF generation
$.getJSON("MOF-database.json", function(data) {
			MOFdata = data;
			
		});
$.getJSON("Blocks-database.json", function(data) {
			blockdata = data;
		});
		
		
		 // x1, y1, z1 checked by default
		$('input:radio[name="x"]').filter('[value="1"]').attr('checked', true);
		$('input:radio[name="y"]').filter('[value="1"]').attr('checked', true);
		$('input:radio[name="z"]').filter('[value="1"]').attr('checked', true);
		
		$('input:radio[name="box"]').filter('[value="box1"]').prop('checked', true);
		$('input:radio[name="box"]').filter('[value="box2"]').prop('checked', false);
		$('input:radio[name="box"]').filter('[value="box3"]').prop('checked', false);
		
		
		
		// MOF generation accordion
		$(".accordion").accordion(); 
		
		// prevent form submission when supercell is submitted
		$("#supercellSelector").submit(function(event) {
			event.preventDefault();
		});
		
		
		//  load supercell of current structure based on radio input
		$("#submitSupercell").click(function() {
			var x = $('input[name=x]:checked').val();
			var y = $('input[name=y]:checked').val();
			var z = $('input[name=z]:checked').val();
			loadSupercell(x, y, z); 
		});
		
	//	$("#boxSelector").hide();
	var count = 0;
		$("#runSimulation").click(function() {		
			$("#addme").empty(); // clear previous output
			
			//Jmol.script(jmolApplet0, 'zap; set autobond on; load ./MOFs/' + name + '.cif {1 1 1}; spacefill only; zoom 60;');
			
			if (count != 0) {
			Jmol.script(jmolApplet0, 'select boron; hide {selected}');
			console.log(count);
		}
			var overString = '';
			if (demo) {
				var boxSize = $('input[name=box]:checked').val();
				name = "Kr" + boxSize;
				Jmol.script(jmolApplet0, 'load ./MOFs/' + name + '.cif {1 1 1};');
			}
			demo = false;
			probeNumber = $("#probeCount").val();
			probeSize = $("#probeSize").val();
			if (probeSize < 0.05) {
				probeSize = 0.1;
			}
			var modelInfo = Jmol.getPropertyAsArray(jmolApplet0, "fileInfo");
		
			cellA = modelInfo['models'][0]['_cell_length_a'];
			cellB = modelInfo['models'][0]['_cell_length_b'];
			cellC = modelInfo['models'][0]['_cell_length_c'];	
			Jmol.script(jmolApplet0, 'define MOF C*,H*,N*,O*; define nah A*');
			//Jmol.script(jmolApplet0, 'select *; var s = {selected}.lines.length; print s;');
			//var currentShown = Jmol.evaluateVar(jmolApplet0, "{*}.lines.length");
			currentNumber = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo").length;
	//		console.log(currentNumber);
			
			//Jmol.script(jmolApplet0, 'set autobond off; load APPEND ./MOFs/Nitrogens.cif;');
			
			// get cell length
			
			//console.log(modelInfo['models'][0]['_cell_length_a']);
			
			/////
			var coordinates = '';
			var coordArray = [];
			var inlineString = probeNumber.toString() + "\n" + "Probes\n";
			
			for (i=1;i<=probeNumber;i++) {
				coordinates = getRandomCo(i);
				
				inlineString+= ' B ' + coordinates + '\n';
			}
		
		//var x = Jmol.evaluateVar(jmolApplet0, "script('set autobond off; var q = " + inlineString  +  ";  load APPEND " + '@q' + "; select on {B* and within(0.8, O*, C*, H*)}; var s = {selected}.length; print s;')");
		Jmol.script(jmolApplet0, 'set autobond off; var q = "' + inlineString + '";  load APPEND "@q"; zoom 60; select on {B* and within(0.8, O*, C*, H*)}; var s = {selected}.length; print s; select boron; spacefill ' + probeSize + ';');

		var molInfo = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo");
		//console.log(molInfo[0]['x']);
		worker.postMessage([coordinateArray, molInfo, currentNumber, probeSize, [cellA, cellB, cellC]]);
		worker.onmessage = function(event) {
			overString = event.data;
			count = (overString.match(/B/g) || []).length;
			//console.log(count);
			if (count != 0) {
			Jmol.script(jmolApplet0, 'select ' + overString + '; hide {selected}; zoom 60;'); 
			}
			//console.log(numberSelfOverlap);
			$("#addme").append('<br /><br />' + probeNumber + ' probes used, ' + count + ' probes overlapped either with each other or with the given structure.');
			//Jmol.script(jmolApplet0, 'console; select {B* and visible}; var q = {selected}.length; print q;');
			
			var molInfo = Jmol.getPropertyAsArray(jmolApplet0, "modelInfo");
			
			if (name.indexOf('Kr') > -1) {
				var remainingProbes = probeNumber - count; 
				var krVol = cellA*cellB*cellC - remainingProbes*(Math.pow(probeSize,3) * Math.PI * 4/3);
				krVol = krVol.toFixed(2); 
				$("#addme").append('<br /> The volume of Krypton is 27.3 A^3. The volume obtained through simulation is: ' + krVol + 'A^3.');
			}
			
		  }
		

			var upperBound = currentNumber + probeNumber; 

			
		
		return true;
			
		});
		var coordinateArray = [];
		function getRandomCo(p) {
			var rX = (Math.random() * cellA).toFixed(5);
			var rY = (Math.random() * cellB).toFixed(5);
			var rZ = (Math.random() * cellC).toFixed(5);
			var coords = rX + ' ' + rY + ' ' + rZ;
			coordinateArray[p-1] = [rX, rY, rZ]; 
			return coords; 
		} // end of MC simulation
		

		
		$("#spacefill").click(function() {
			Jmol.script(jmolApplet0,'select *; cartoons off; spacefill only;');
		}); 
		
				$("#ballStick").click(function() {
			Jmol.script(jmolApplet0,'select *; cartoons off; spacefill 23%; wireframe 0.15;');		
		}); 
		

		
		$('#generate').click(function() {
		
			
			
			 var hashArray =[];
			 i=0;
			 $(".selected").each(function () {
				hashArray[i] = blockdata[$(this).attr('hash')];
				i++;
			 });

			hashArray = hashArray.sort();
			hash = hashArray.join('');
			console.log(hash);
			console.log(MOFdata);
			mof = MOFdata[hash];
			console.log(mof);
			  if (mof == null) {
				  $("#mofFail").show();
				  clearAll();
			  }
			 else {
			loadViewer(mof['name']);
			
			$('#learnMore').attr('href',mof['link']); 
			
			  }
			 $(".buildBlock").removeClass("selected");
		 
		});
		
		
		$("#mcDemo").click(function() {
			demo = true; 
			$("#boxText").show();
			$("#boxRadio").show();
			name = "Kr5";
			console.log(name);
			//$("#boxSelector").show();
			Jmol.script(jmolApplet0, 'load ./MOFs/' + name + '.cif {1 1 1};');
		});
		
		function loadViewer(name) {
			name = name.toString();
			Jmol.script(jmolApplet0,'set autobond on; load ./MOFs/' + name + '.cif {1 1 1};');
		}
		
		function loadSupercell(x,y,z) {
			Jmol.script(jmolApplet0, 'load ./MOFs/' + name + '.cif {' + x + ' ' + y + ' ' + z + '}');
		}
		
		function clearAll() {
			$(".buildBlock").removeClass("selected");
			hashArray = [];	
			
		}
		
		$("#infoBox").hide();
		$("#maker").hide();
		$("#MCContainer").hide();
		$("#supercellContainer").hide();
		$("#boxText").hide();
		$("#boxRadio").hide();
		$('#clear').click(function() {
			clearAll();
			$("#mofFail").hide();	
		});
		$("#clearMC").click(function() {
			Jmol.script(jmolApplet0, 'zap; set autobond on; load ./MOFs/' + name + '.cif {1 1 1}; spacefill only;');
			count=0;
			$("#addme").empty();
		});
		
		
		
		// Collapsible menu controls - needs streamlining
		function hideMC() {
			$("#MCIconDown").hide();
			$('#MCIconRight').show();			
			$("#MCContainer").slideUp("slow");
		}
		function showMC() {
			$("#MCIconRight").hide();
			$('#MCIconDown').show();
			$("#MCContainer").slideDown("slow");
		}
		
		function hideSupercell() {
			$("#spIconDown").hide();
			$('#spIconRight').show();		
			$("#supercellContainer").slideUp("slow");
		}
		
		function showSupercell() {
			$("#spIconRight").hide();
			$('#spIconDown').show();		
			$("#supercellContainer").slideDown("slow");
		}
		
		function hideMaker() {
			$("#makeIconDown").hide();
			$('#makeIconRight').show();
			$("#maker").slideUp("slow");
		}

		function showMaker() {
			$("#makeIconRight").hide();
			$('#makeIconDown').show();	
			$("#maker").slideDown("slow");
		}
			
		$("#makeButton").click(function() {
			
				if ( $('#maker').is(':visible') ) {
					hideMaker();					
				}
				else {
					showMaker();
				}
				if ( $('#supercellContainer').is(':visible') ) {					
					hideSupercell();					
				}
				if ( $('#MCContainer').is(':visible') ) {
					hideMC();
				}
		});
		
		$("#showMCButton").click(function() {
				if ( $('#MCContainer').is(':visible') ) {
					hideMC();
				}
				else {
					showMC();
				}
				if ( $('#supercellContainer').is(':visible') ) {					
					hideSupercell();					
				}
				if ( $('#maker').is(':visible') ) {
					hideMaker();					
				}
		});
		$("#supercellButton").click(function() {
				if ( $('#supercellContainer').is(':visible') ) {					
					hideSupercell();					
				}
				else {
					showSupercell();					
				}
				if ( $('#MCContainer').is(':visible') ) {
					hideMC();
				}
				if ( $('#maker').is(':visible') ) {
					hideMaker();					
				}
		});
		
		$(".buildBlock").click(function () {
			if ($("#mofFail").is(":visible")) {
				$("#mofFail").hide();
			}
			$(this).toggleClass("selected");
		});
		
		
		// fix ajax json call 
		// allowing json object to be retrieved
		$.ajaxSetup({beforeSend: function(xhr){
  if (xhr.overrideMimeType)
  {
    xhr.overrideMimeType("application/json");
  }
}
});
////////////


 });
 
