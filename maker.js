$(function() {
		var channelString = '';
	var loadedName = '';
	var channelStrings = {};
	var userLoaded = false;
	var isTriclinic = false;
	var cellMatrix = [];
	var inverseMatrix = [];
	var t = '';
	var name = '';
	var cellA = 0;
	var cellB = 0;
	var cellC = 0;
	var vectA = [];
	var vectB = [];
	var vectC = [];
	var displayType = 'spacefill only'; // used to preserve display type when a file is uploaded
	var layerX = [];
	var layerY = [];
	var layerZ = [];
	var sliderTemp = 0;
	var channelDisplay = false;
	var fileRequested = false;
	var xyzFile ='';
	
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
   script: "set antialiasDisplay;background white; load " + str + " {1 1 1}; rotate y 30; rotate x 30; set appendNew false; set defaultDropScript '';  set displayCellParameters false; zoom 40; spacefill 23%; wireframe 0.15; background image './Images/gradBlue2.png';",       // script to run
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

// hardcoded DOTSOV cell matrix
		cellMatrix = [ 26.2833, 0, 0, 1.6093879608014814e-15, 26.2833, 0, 1.6093879608014814e-15, 1.6093879608014816e-15, 26.2833 ];
		inverseMatrix = inverse3x3(cellMatrix);

		$("#unitcellInfo").html('density = 0.885 g/cm<sup>3</sup> <br /> a = 26.283 &#197; <br /> b = 26.283 &#197; <br /> c = 26.283 &#197; <br /> &#945; = 90.000&#176; <br /> &#946; = 90.000&#176; <br /> &#947; = 90.000&#176;');   


// JSmol Applet
var myJmol = Jmol.getAppletHtml("jmolApplet0", Info);

  $("#viewer2")
  .html(myJmol)
} // end initializeJmol
name = "DOTSOV";
// name of initial load, subsequently name of loaded file
var nameString = "./MOFs/" + name + ".cif";
initializeJmol(nameString);


		$.getJSON("MOF-database.json", function(data) {
			MOFdata = data;
		});

var possibleMOFArray = [["bb1", "cn1"], ["bb1", "cn1", "bb4"], ["bb2", "cn1"], ["bb1", "cn2"], ["bb3","cn3"]];
var blockArray = ["bb1", "bb2", "bb3", "bb4", "cn1", "cn2", "cn3"];		
		
// add border to selected building block and increase transperancy of blocks that can not be combined		
$(".buildBlock").click(function () {
		if ($("#mofFail").is(":visible")) {
			$("#mofFail").hide();
		}
		
		currentClass = $(this).attr('class');
		var notAllowed = currentClass.indexOf('notPossible') > -1;
		if (!notAllowed) {
					
		$(this).toggleClass("selected");
		
		var selectedID = $(this).attr('id');
		
		var index = 0;
		var possibleBlockArray = [];
		for (i=0;i<possibleMOFArray.length;i++) {
			if (isInArray(selectedID,possibleMOFArray[i])) {
				for (j=0; j<possibleMOFArray[i].length; j++) {
						possibleBlockArray[index] = possibleMOFArray[i][j]; 	
						index++;		
				}	
			}
		}
		
		possibleBlockArray=possibleBlockArray.filter(function(item,i,allItems){ // kill duplicates 
		return i==allItems.indexOf(item);
		});
		
		for (i=0;i<blockArray.length;i++) {
			if (!isInArray(blockArray[i],possibleBlockArray)) {
				$('#' + blockArray[i]).addClass("notPossible"); // flag all not possible blocks
			}
		}
	}
		
	});
	
$("#saveMaker").click(function() {
	Jmol.script(jmolApplet0, 'write FILE "' + name + '.cif";');
});	
	
	$('#generate').click(function() {
		var hashArray =[];
		i=0;
		$(".selected").each(function () {
			hashArray[i] = $(this).attr('id');
			i++;
		});
		hashArray = hashArray.sort();
		hash = hashArray.join('');
		if (MOFdata[hash] == null) {
			$("#mofFail").show();
			clearAll();
		} 
		else {
			mof = MOFdata[hash];
			name = mof['name'];
			loadViewer(mof['name']);
			cellMatrix = computeCellMatrix();
			$('#learnMore').attr('href',mof['link']);
		}
		$(".buildBlock").removeClass("selected");
		$(".buildBlock").removeClass("notPossible");
	});
	
	
	function computeCellMatrix() {
		var fileInfo = Jmol.getPropertyAsArray(jmolApplet0, "fileInfo");
		var angle = [];
		var side = [];

			
			angle[0] = fileInfo['models'][0]['_cell_angle_alpha'];
			angle[1] = fileInfo['models'][0]['_cell_angle_beta'];
			angle[2] = fileInfo['models'][0]['_cell_angle_gamma'];
			
			side[0] = fileInfo['models'][0]['_cell_length_a'];
			side[1] = fileInfo['models'][0]['_cell_length_b'];
			side[2] = fileInfo['models'][0]['_cell_length_c'];
			
			
			
			for (i=0;i<side.length;i++) {
				side[i] = +side[i];
				angle[i] = +angle[i];
			}
		
		if (angle[0] == angle[1] && angle[1] == angle[2]) {
			isTriclinic = false;
		} else {
			isTriclinic = true;
		}
		displayUnitcellInfo(side,angle);
		
		// an assumption is made at this point that vector (a) is parallel to the x-axis or (1,0,0)
		// (b) is in the xz-plane and (c) has a positive y component.
		// further, alpha is the angle (bc), beta is (ac), gamma is (ab)
		// if this is the case, then the vectors (a), (b), (c) may be calculated
		// using polar coordinates, theta = angle with (a), psi = angle with (b)
		// angle is now [alpha, beta, gamma]
		// side is [a, b, c]
		cellA = +side[0];
		cellB = +side[1];
		cellC = +side[2];
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
		
		cellMatrix = [a_x, a_y, a_z, b_x, b_y, b_z, c_x, c_y, c_z];
		return cellMatrix;
	}
	
	
	
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
			
			//mass = +mass.toFixed(3);
			mass = parseFloat(mass);
			mass = mass.toFixed(1);
			
			density = massGrams / (cellVol * Math.pow(10,-24)); // density in g/cm3
			density = density.toFixed(3);
			$("#unitcellInfo").html('density = ' + density + ' g/cm<sup>3</sup> <br /> a = ' + sides[0] + ' &#197; <br /> b = ' + sides[1] + ' &#197; <br /> c = ' + sides[2] + ' &#197; <br /> &#945; = ' + angles[0] + '&#176; <br /> &#946; = ' + angles[1] + '&#176; <br /> &#947; = ' + angles[2] + '&#176;');   
		});
	}
	

	function loadViewer(name) {
		name = name.toString();
		Jmol.script(jmolApplet0,'set autobond on; load ./MOFs/' + name + '.cif {1 1 1}; rotate y 30; rotate x 30; zoom 40; spacefill 23%; wireframe 0.15; background image "./Images/gradBlue2.png";');		
	}
	
	function clearAll() {
		$(".buildBlock").removeClass("selected");
		$(".buildBlock").removeClass("notPossible");
		hashArray = [];
	}
	
	$('#clearMaker').click(function() {
		clearAll();
		$("#mofFail").hide();
	});
	
	$( "#accordion1" ).accordion( {
		collapsible: true,
		active: false,
		heightStyle: "content"
	}
	);
	$( "#accordion2" ).accordion( {
		collapsible: true,
		active: false,
		heightStyle: "content"
	}
	);
	
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
				Jmol.script(jmolApplet0,'select *; set autobond on; cartoons off; spacefill only;');
			}
			if ($(this).val() == "BallStick") {
				Jmol.script(jmolApplet0,'select *; set autobond on; cartoons off; spacefill 23%; wireframe 0.15;');
			}
			if ($(this).val() == "Wireframe") {
				Jmol.script(jmolApplet0,'select *; set autobond on; cartoons off; wireframe -0.1;');
			}
	});
	
	var unitCellDisplay = true;
	$('input:radio[name="unitCell"]').filter('[value="On"]').prop('checked', true);
	$('input:radio[name="unitCell"]').change(function() {
		if ($(this).val() == "On") {
			$("#unitcellInfo").show();
			unitCellDisplay = true;
			Jmol.script(jmolApplet0, 'unitcell on; axes on;');
		}
		else {
			$("#unitcellInfo").hide();
			unitCellDisplay = false;
			Jmol.script(jmolApplet0, 'unitcell off; axes off;');
		}
	});	
	
	
	$("#submitSupercell").click(function() {
		var x = $('input[name=x]:checked').val();
		var y = $('input[name=y]:checked').val();
		var z = $('input[name=z]:checked').val();
		loadSupercell(x, y, z);
	}
	);
	
	function loadSupercell(x,y,z) {
			Jmol.script(jmolApplet0, 'load ./MOFs/' + name + '.cif {' + x + ' ' + y + ' ' + z + '}; rotate y 30; rotate x 30; set autobond on; spacefill 23%; wireframe 0.15; background image "./Images/gradBlue2.png";');
	}
	
	//////////////// CHANNELS
	
	
	
	var unitCellDisplay = true;
	$('input:radio[name="unitCell"]').filter('[value="On"]').prop('checked', true);
	$('input:radio[name="unitCell"]').change(function() {
		if ($(this).val() == "On") {
			$("#unitcellInfo").show();
			unitCellDisplay = true;
			Jmol.script(jmolApplet0, 'unitcell on; axes on; boundbox on;');
		}
		else {
			$("#unitcellInfo").hide();
			unitCellDisplay = false;
			Jmol.script(jmolApplet0, 'unitcell off; axes off; boundbox off;');
		}
	});	
	
	/////////////////////////////////
	//////// CHANNELS AND STRUCTURE 
	/////////////////////////////////
	
	$("#saveChannel").click(function() {
			fileRequested = true;
			submitChannels();		
	});

	//~ $("#learnMore").click(function() {
		//~ $("#learnMorePopup").show();
		//~ $("#learnMorePopup").draggable();
		//~ $("#learnMoreContent").show();
		//~ 
	//~ });
	//~ 
	$("#closeLMPopupChannel").click(function() {
		$("#learnMorePopupChannel").hide();
	});
	
	$("#learnChannel").click(function() {
		$("#learnMorePopupChannel")
		.show()
		.draggable();
	});
	
	
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
				saveAs(blob, "structureChannels.pdb");
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
		function polarVect(r,t,p) {
		return [r*Math.sin(p)*Math.cos(t), r*Math.sin(p)*Math.sin(t), r*Math.cos(p)];
	}
	
	$("#explorerLink").click(function() {
		window.location.href = './mofPage.html#' + name; 
	});
	
		function isInArray(value, arr) {
  return arr.indexOf(value) > -1;
}	
	
});
