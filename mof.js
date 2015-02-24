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
   script: "set antialiasDisplay;background white; load ./MOFs/DOTSOV.cif {1 1 1}; set appendNew false; zoom 60; spacefill only;",       // script to run
   defaultModel: "",   // name or id of a model to be retrieved from a database
   addSelectionOptions: false,  // to interface with databases
   debug: false
 };	 

// JSmol Applet
var myJmol = Jmol.getAppletHtml("jmolApplet0", Info);


  $("#viewer")
  .append(myJmol)
  .addClass("padded");

// get JSON files which act as hashtables for MOF generation
$.getJSON("MOF-database.json", function(data) {
			MOFdata = data;
			
		});
$.getJSON("Blocks-database.json", function(data) {
			blockdata = data;
		});
		
		
		
		
	/*	
		function handleFileSelect(event) {
			var files = event.target.files; 
			var reader = new FileReader();
			reader.onload = (function(theFile) {
				return function(e) {
					console.log(e.target.result);
					
				}
				
			});
			}

		*/
		
		var t = '';
		var userLoaded = false; 
		function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          t = e.target.result;
          Jmol.script(jmolApplet0, 'var t = "' + t + '"; print t; load "@t" {1 1 1}; spacefill only;');
          var c  = Jmol.getPropertyAsArray(jmolApplet0, "boundBoxInfo"); // use to establish size
		  cellA = c['corner1'][0] - c['corner0'][0];
		  cellB = c['corner1'][1] - c['corner0'][1];
		  cellC = c['corner1'][2] - c['corner0'][2];
		  userLoaded = true; 
        };
      })(f);

      // Read 
      reader.readAsText(f);
    }
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);
		
		
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
		var flaggedProbeCount = 0;
		var firstRun = true;
		$("#runSimulation").click(function() {		
			
		
			Jmol.script(jmolApplet0, 'select boron; spacefill 0;');
			
			
			// define the web worker, overlap_worker.js which performs MC computations in the background

		
			if (typeof(w) == "undefined") {
			var worker = new Worker("overlap_worker.js");
		}
		
			$("#addme").empty(); // clear previous output
			
			
			if (flaggedProbeCount != 0) {
			Jmol.script(jmolApplet0, 'select boron; hide {selected}');
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


			if (!userLoaded) {
			var modelInfo = Jmol.getPropertyAsArray(jmolApplet0, "fileInfo");
		
			cellA = modelInfo['models'][0]['_cell_length_a'];
			cellB = modelInfo['models'][0]['_cell_length_b'];
			cellC = modelInfo['models'][0]['_cell_length_c'];	
			}
			
			currentNumber = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo").length;

			var coordinates = '';
			var coordArray = [];
			var inlineString = probeNumber.toString() + "\n" + "Probes\n";
			
			for (i=1;i<=probeNumber;i++) {
				coordinates = getRandomCo(i);
				
				inlineString+= ' B ' + coordinates + '\n';
			}
			
			if (isNaN(probeSize) || isNaN(probeNumber)) {
				$("#addme").append('<br /> Please enter a valid number for the probe quantity and size.');
				return;
			}
			else {
				probeSize = +probeSize;	// convert string to number
			}
			
			var probeDisplaySize = probeSize;
			if (probeDisplaySize < 0.01) {
				probeDisplaySize = 0.1; 
			}
			if (probeDisplaySize == 1.0) { // error with precisely 1 as input for "spacefill" Jmol function 
				probeDisplaySize = 1.001;
			} 
		
		
		// see JMOL documentation for x = contact{ ...

		Jmol.script(jmolApplet0, 'set autobond off; delete B*; var q = "' + inlineString + '"; load APPEND "@q"; zoom 60; select boron; spacefill ' + probeDisplaySize + ';');


		var molInfo = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo");
		var adjustment = 0;
		var done = false; 

		
		flaggedProbeCount = 0;
		var upperBound = probeNumber/500;
		for (i=0;i<upperBound;i++) {
			var start = 500*i;
			var end = 500*(i+1);
			worker.postMessage([coordinateArray.slice(start, end), molInfo, currentNumber, probeSize, [cellA, cellB, cellC], i, probeNumber]);
			worker.onmessage = function(event) {
				response = event.data;
				overString = response[0];
				done = response[1];
				flaggedProbeCount += (overString.match(/B/g) || []).length;
				if (done) {
					$("#addme").append('<br /><br />' + probeNumber + ' probes used, ' + flaggedProbeCount + ' probes overlapped with the given structure.');		
					worker.terminate();
					if (name.indexOf('Kr') > -1) {
				var remainingProbes = probeNumber - flaggedProbeCount; 
				var krVol = cellA*cellB*cellC*flaggedProbeCount/probeNumber;
				krVol = krVol.toFixed(2); 
				$("#addme").append('<br /> The volume of Krypton is 27.3 A^3. The volume obtained through simulation is: ' + krVol + 'A^3.');
			}	
					} 			
			}
		}
		
		//$("#addme").append('<br /><br />' + probeNumber + ' probes used, ' + flaggedProbeCount + ' probes overlapped with the given structure.');
			
			var molInfo = Jmol.getPropertyAsArray(jmolApplet0, "modelInfo");
			
			
			
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
			mof = MOFdata[hash];
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
			Jmol.script(jmolApplet0, 'load ./MOFs/' + name + '.cif {1 1 1};');
		});
		
		function loadViewer(name) {
			name = name.toString();
			Jmol.script(jmolApplet0,'set autobond on; load ./MOFs/' + name + '.cif {1 1 1}; spacefill only;');
		}
		
		function loadSupercell(x,y,z) {
			Jmol.script(jmolApplet0, 'load ./MOFs/' + name + '.cif {' + x + ' ' + y + ' ' + z + '}; set autobond on; spacefill only;	');
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
			//Jmol.script(jmolApplet0, 'zap; set autobond on; load ./MOFs/' + name + '.cif {1 1 1}; spacefill only;');
			Jmol.script(jmolApplet0, 'delete B*;');
			$("#probeCount").val('');
			$("#probeSize").val('');
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
 
