	$(function() {
// layout
// VARIABLES
// SCRIPT/FUNCTIONS
// NAVIGATION		
		
	// global variables	
	var loaded = true;	
	var demo = false;
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
	
	var transf = [];
	var angle = [];
	var side = [];
	
	// non-orthorhombic lattice vectors
	var vectA = [];
	var vectB = [];
	var vectC = [];
	var cellVol = 0; 
	var mass = 0;
		
	
showMOF();
//////////////////////////////////////
// LOAD MOF structure
/////////////////////////////////////

function showMOF() {
	name = "DOTSOV"; // name of initial load, subsequently name of loaded file
	var nameString = "./MOFs/" + name + ".cif"; // path to loaded file
	initializeJmol(nameString,demo);
// get JSON files which act as hashtables for MOF generation
$.getJSON("MOF-database.json", function(data) {
			MOFdata = data;
			
		});
$.getJSON("Blocks-database.json", function(data) {
			blockdata = data;
		});
$.getJSON("atomMasses.json", function(data) {
			masses = data;
});		
	 } // end showMOF()

	function initializeJmol(str,demo) {
	// JSmol config
	 var Info = {
 color: "#FFFFFF", // white background (note this changes legacy default which was black)
   height: "200%",      // pixels (but it may be in percent, like "100%")
   width: "100%",
  use: "HTML5",     // "HTML5" or "Java" (case-insensitive)
   j2sPath: "./jsmol/j2s",          // only used in the HTML5 modality
   jarPath: "java",               // only used in the Java modality
   jarFile: "JmolApplet0.jar",    // only used in the Java modality
   isSigned: false,               // only used in the Java modality
   serverURL: "php/jsmol.php",  // this is not applied by default; you should set this value explicitly
  // src: initialMOF,          // file to load
   script: "set antialiasDisplay;background white; load " + str + "; set appendNew false; zoom 60; spacefill only;",       // script to run
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
if (demo) {
  $("#viewer2")
  .append(myJmol)
  .addClass("padded");
}
else {
	$("#viewer")
  .append(myJmol)
  .addClass("padded");
}
} // end initializeJmol

////////////////////////////////////////////////

/////////////////////////////////////////
/////// UPLOAD FILE FROM DIALOGUE OR DARG & DROP
/////////////////////////////////////////

// drag and drop controls
var obj = $("#mofPage");
obj.on('dragenter', function (e) 
{
    e.stopPropagation();
    e.preventDefault();
    obj.addClass("border");
});
obj.on('dragleave', function(e) {
	obj.removeClass('border');
});
obj.on('dragover', function (e) 
{
     e.stopPropagation();
     e.preventDefault();
});
obj.on('drop', function (e) 
{
      e.preventDefault();
     var files = e.originalEvent.dataTransfer.files;
           
      for (var i = 0, f; f = files[i]; i++) {
           
     var reader = new FileReader();

		reader.onload = (function(theFile) {
        return function(e) {
          t = e.target.result;
          Jmol.script(jmolApplet0, 'var t = "' + t + '"; load "@t" {1 1 1}; spacefill only;');
		  
        };
      })(f);
      reader.readAsText(f);
     } 
    obj.removeClass("border");
    handleFileUpload(files,obj);
});
$(document).on('dragenter', function (e) 
{
    e.stopPropagation();
    e.preventDefault();
});
$(document).on('dragover', function (e) 
{
  e.stopPropagation();
  e.preventDefault();
});
$(document).on('drop', function (e) 
{
    e.stopPropagation();
    e.preventDefault();
 });

function handleFileUpload(files,obj)
{
   for (var i = 0; i < files.length; i++) 
   {
        var fd = new FormData();
        fd.append('file', files[i]);
    }
}

// once a file is uploaded, perform unit cell calculations, generate cell matrix (with inverse)		
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
          Jmol.script(jmolApplet0, 'var t = "' + t + '"; load "@t" {1 1 1}; spacefill only;');
          var c  = Jmol.getPropertyAsArray(jmolApplet0, "boundBoxInfo"); // used for corner locations
		  angleIndices = [t.indexOf('_cell_angle_alpha'), t.indexOf('_cell_angle_beta'), t.indexOf('_cell_angle_gamma')];
		  sideIndices = [t.indexOf('_cell_length_a'), t.indexOf('_cell_length_b'), t.indexOf('_cell_length_c')];
		  angleSubstrings = [t.substring(angleIndices[0]), t.substring(angleIndices[1]), t.substring(angleIndices[2])];
		  sideSubstrings = [t.substring(sideIndices[0]), t.substring(sideIndices[1]), t.substring(sideIndices[2])];
		  
		  // find angle (works for floats and ints)
		  var floatExp = /\d+\.\d+/;
		  var intExp = /\d+/;
		 
		  for (i=0;i<3;i++) {
			  if (angleSubstrings[i].search(floatExp) <= angleSubstrings[0].search(intExp)) {
				  angle[i] = +angleSubstrings[i].match(floatExp)[0];
				}
			  else {
				  angle[i] = +angleSubstrings[i].match(intExp)[0];  
			  }
			  if (sideSubstrings[i].search(floatExp) <= sideSubstrings[0].search(intExp)) {
				  side[i] = +sideSubstrings[i].match(floatExp)[0];
				}
			  else {
				  side[i] = +sideSubstrings[i].match(intExp)[0];  
			  }
			  
		  }
		  // angle is now [alpha, beta, gamma]
		  // side is [a, b, c]
		  cellA = side[0];
		  cellB = side[1];
		  cellC = side[2];
		  		  
		  if (angle[0] == angle[1] && angle[1] == angle[2]) {
			  isTriclinic = false;
		  }
		  else {
			  isTriclinic = true;
		 // an assumption is made at this point that vector (a) is parallel to the x-axis or (1,0,0)
		 // (b) is in the xz-plane and (c) has a positive y component.
		 // further, alpha is the angle (bc), beta is (ac), gamma is (ab)
		 // if this is the case, then the vectors (a), (b), (c) may be calculated
		 
		 // using polar coordinates, theta = angle with (a), psi = angle with (b)
		 
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
		inverseMatrix = inverse3x3(cellMatrix);
		
		  
		  }
		 
		  
		  userLoaded = true; 
		  loaded = true; 
		  $("#boxText").hide();
		  $("#boxRadio").hide();
		  demo = false; 
		  name = 'userloaded';
		  
        };
      })(f);

      // Read 
      reader.readAsText(f);
    }
  } // end function file select
  
  document.getElementById('files').addEventListener('change', handleFileSelect, false);
	
////////////////////////////////////////
//// DISPLAY PARAMETERS
////////////////////////////////////////	
		
		
		 // x1, y1, z1 checked by default
		$('input:radio[name="x"]').filter('[value="1"]').attr('checked', true);
		$('input:radio[name="y"]').filter('[value="1"]').attr('checked', true);
		$('input:radio[name="z"]').filter('[value="1"]').attr('checked', true);
		
		$('input:radio[name="box"]').filter('[value="box1"]').prop('checked', true);
		$('input:radio[name="box"]').filter('[value="box2"]').prop('checked', false);
		$('input:radio[name="box"]').filter('[value="box3"]').prop('checked', false);
		
		
		// MOF generation accordion
		$(".accordion").accordion(); 
		
		// and tabs
		$( "#tabs" ).tabs();
 		
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
		
		var flaggedProbeCount = 0;
		var firstRun = true;
		
//////////////////////////////////////////
		
		$(".run").click(function() {	
			if (hidden) {
				console.log('hidden');
				Jmol.script(jmolApplet0, 'zap; load ./MOFs/' + name + '.cif {1 1 1}; spacefill only;');
				$("#hideMOF").html('Hide Structure');
			}
			
			if (loaded) {
			transf  = Jmol.getPropertyAsArray(jmolApplet0, "boundBoxInfo"); 
			}
		
			Jmol.script(jmolApplet0, 'select boron; spacefill 0;');
			
			$("#addme").empty(); // clear previous output
			
			
			if (flaggedProbeCount != 0) {
			Jmol.script(jmolApplet0, 'select boron; hide {selected}');
		}
			var overString = '';
			if (demo) {
				var boxSize = $('input[name=box]:checked').val();
				name = "Kr" + boxSize;
				Jmol.script(jmolApplet0, 'load ./MOFs/' + name + '.cif {1 1 1};');
				cellA = +boxSize;
				cellB = +boxSize;
				cellC = +boxSize;

			}
			
			probeNumber = $("#probeCount").val();
			probeSize = $("#probeSize").val();

			var modelInfo = Jmol.getPropertyAsArray(jmolApplet0, "fileInfo");

			if (!userLoaded && !demo) {			
			cellA = modelInfo['models'][0]['_cell_length_a'];
			cellB = modelInfo['models'][0]['_cell_length_b'];
			cellC = modelInfo['models'][0]['_cell_length_c'];	
			}
						
			currentNumber = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo").length;
			
			
			//var isTriclinic = triclinicCheck();
			
			function triclinicCheck() {
				var center = transf['center'];
				var vect = transf['vector'];
				
				return Math.abs(center[0] - center[1]) > 0.01 || Math.abs(center[0] - center[2]) > 0.01 || Math.abs(center[1] - center[2]) > 0.01;
			}
			
			var inlineString = probeNumber.toString() + "\n" + "Probes\n";
						
			
			if (isNaN(probeSize) || isNaN(probeNumber)) {
				$("#addme").append('<br /> Please enter a valid number for the probe quantity and size.');
				return;
			}
			else {
				probeSize = +probeSize;	// convert string to number
			}
			
			var probeDisplaySize = probeSize;
			if (probeDisplaySize < 0.1) {
				probeDisplaySize = 0.1; 
			}
			if (probeDisplaySize == 1.0) { // error with precisely 1 as input for "spacefill" Jmol function 
				probeDisplaySize = 1.001;
			} 
				

		var molInfo = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo");
		var adjustment = 0;
		var done = false; 
		var mode = $(this).attr('id');
		
		////////////////// For VOID FRACTION AND PORE SIZE DISTRIBUTION 
		if (mode == 'VF' || mode == 'PSD' || mode == 'negativeStructure') {
				if (typeof(w) == "undefined" && mode == 'VF') {
					var worker = new Worker("overlap_worker.js");
				}
				if (typeof(w) == "undefined" && mode == 'PSD') {
					var worker = new Worker("poresize_worker_3.js");
				}
				
				 function tricFunc() {	
			for (i=1;i<=probeNumber;i++) {
				var xx = Math.random();
				var yy = Math.random();
				var zz = Math.random();
				var tricCoords = Jmol.evaluateVar(jmolApplet0, '[{' + xx + '/1 ' + yy + '/1 ' + zz + '/1}.x {' + xx + '/1 ' + yy + '/1 ' + zz + '/1}.y {' + xx + '/1 ' + yy + '/1 ' + zz + '/1}.z];');
				tricCoords[0] = Math.abs(tricCoords[0]).toString();
				tricCoords[1] = Math.abs(tricCoords[1]).toString();
				tricCoords[2] = Math.abs(tricCoords[2]).toString();
				coordinateArray[i-1] = tricCoords;
				inlineString += ' B ' + tricCoords[0] + ' ' + tricCoords[1] + ' ' + tricCoords[2] + '\n';					
			}	
			loaded = false; 
		}
			
			
			
			if (!isTriclinic || demo) {
			var coordinates = '';
			var coordArray = [];
			demo.html
			for (i=1;i<=probeNumber;i++) {
				coordinates = getRandomCo(i); // updates coordinateArray as well
				inlineString+= ' B ' + coordinates + '\n';
				}
			}			
			else { tricFunc(); 
			}
			
			
			if (mode == 'VF') {
				
			
			
			Jmol.script(jmolApplet0, 'set autobond off; delete B*; var q = "' + inlineString + '"; load APPEND "@q"; zoom 60; select boron; spacefill ' + probeDisplaySize + ';');


		
			flaggedProbeCount = 0;
			
			var upperBound = probeNumber/500;
				for (i=0;i<upperBound;i++) {
						var start = 500*i;
						var end = 500*(i+1);
						worker.postMessage([coordinateArray.slice(start, end), molInfo, currentNumber, probeSize, [cellA, cellB, cellC], i, probeNumber, isTriclinic, cellMatrix, inverseMatrix]);
						worker.onmessage = function(event) {
						response = event.data;
						overString = response[0];
						Jmol.script(jmolApplet0, 'select ' + overString + '; delete selected;'); // hide overlapping probes
						done = response[1];
						flaggedProbeCount += (overString.match(/B/g) || []).length;
							if (done) {
								//$("#addme").append('<br /><br />' + probeNumber + ' probes used, ' + flaggedProbeCount + ' probes overlapped with the given structure.');	
								vFraction = (1-flaggedProbeCount/probeNumber).toFixed(3);	
								$("#addme").append('<br /><br /> The void fraction is ' + vFraction);		
								worker.terminate();
							if (name.indexOf('Kr') > -1) {
								//	var remainingProbes = probeNumber - flaggedProbeCount; 
								var krVol = cellA*cellB*cellC*flaggedProbeCount/probeNumber;
								krVol = krVol.toFixed(2); 
								$("#addme").append('<br /> The volume of Krypton is 27.3 A^3. The volume obtained through simulation is: ' + krVol + 'A^3.');
					}	
					} 			
			}
		}	
	} // worker call for VF
	
			if (mode == 'PSD') {
				console.log(cellMatrix);
				worker.postMessage([molInfo, probeNumber, [cellA, cellB, cellC], isTriclinic, inverseMatrix,coordinateArray.slice(start, end), cellMatrix]);
				worker.onmessage = function(event) {
					response = event.data;
					histArray = response[0];
					stepSize = response[1];
					console.log(histArray);
					
					generateHistogram(histArray, probeSize, stepSize);
				}
	}// end if PSD, worker call 
	
			} // end if void fraction calculations are requested (as opposed to surface area)
		
		////////////// FOR SURFACE AREA 
				if (mode == 'SA') {
				
				var workerSA = new Worker("surface_worker_3.js");
				
				
				
				if (!isTriclinic) {
					cellVol = cellA*cellB*cellC;
				}
				else {
					cellVol = triclinicVol(vectA, vectB, vectC, angle);
				}
				
				var probeBound = Math.floor(probeNumber/currentNumber); // number of probes per atom
				var surfaceArea = 0;
				$("#addme").empty();
				for (j=0;j<currentNumber;j++) {
					workerSA.postMessage([probeBound, j, molInfo, probeSize, [cellA, cellB, cellC], isTriclinic, cellMatrix, inverseMatrix, masses]);
					workerSA.onmessage = function(event) {
						surfaceArea +=event.data[0];
						done = event.data[1];
						if (done) {
							mass = event.data[2];
							surfaceAreaV = surfaceArea * 10000 / cellVol;
							surfaceAreaG = surfaceArea * Math.pow(10,-20) * 1/mass;
							$("#addme").append('<br /> The surface area is ' + surfaceAreaV.toFixed(2) + ' m^2 / cm^3 <br/> or ' + surfaceAreaG.toFixed(2) + ' m^2/g.');
							workerSA.terminate();
						}
					}	
				}
				} // end for SAs
				
}); // end of MC simulation
		function generateHistogram(rawData, minSize, stepSize) {
			
			
			var upper =  minSize + (rawData.indexOf(0) + 2)*stepSize;
			
			histOptions = {yaxis: {max: 1}, xaxis : {max: 30}};
			
			var data = [];
			var xval = 0;
			var yval = 0;
			console.log(overString);
			//Jmol.script(jmolApplet0, 'select ' + overString + '; delete selected;');
			var tmp = 0;
			for (i=0;i<rawData.length;i++) {
				xval = minSize + i*stepSize;
				
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
				data[j][1] = data[j][1]/tmp; // normalize
				}			
						
			var maxVal = Math.max.apply(null,data);
			
			$.plot($('#histogram'), [data], histOptions);

		}
	
	// fix this??
		function triclinicVol(a,b,c,angles) {
			// angles in radians
			alpha = angles[0]*Math.PI/180;
			beta = angles[1]*Math.PI/180;
			gamma = angles[2]*Math.PI/180;
			
			v = vectMag(a)*vectMag(b)*vectMag(c)*Math.sqrt(1-Math.pow(Math.cos(alpha),2) - Math.pow(Math.cos(beta),2) - Math.pow(Math.cos(gamma),2) + 2*Math.cos(alpha)*Math.cos(beta)*Math.cos(gamma));
			console.log(v);
			 
			 
			crossAB = vectorCross(a,b);
			//console.log(crossAB);
			tripleProd = vectorDot(c,crossAB);
			console.log(tripleProd);
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

var coordinateArray = [];
		function getRandomCo(p) {
			var rX = (Math.random() * cellA).toFixed(5);
			var rY = (Math.random() * cellB).toFixed(5);
			var rZ = (Math.random() * cellC).toFixed(5);
			var coords = rX + ' ' + rY + ' ' + rZ;
			coordinateArray[p-1] = [rX, rY, rZ]; 
			return coords; 
		} 
		

		
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
		
		var hidden = false;
		$("#hideMOF").click(function() {
			Jmol.script(jmolApplet0, 'hide not B*;');
			if (!hidden) {
				$(this).html('Show Structure');
				hidden = true;
			}
			else {
				hidden = false;
				Jmol.script(jmolApplet0, 'load APPEND ./MOFs/' + name + '.cif; select {not B*}; spacefill;');
				$(this).html('Hide Structure');

			}
			
		});
		
		
		
		$( "#accordion1" ).accordion({
      collapsible: true,
      heightStyle: "content"
    });
		$( "#accordion2" ).accordion({
      collapsible: true,
      heightStyle: "content"
    });
		
		/*
		// Collapsible menu controls - needs streamlining
		function hideMC() {
			$("#makeIconDown").hide();
			$('#makeIconRight').show();			
			$("#MCContainer").slideUp("slow");
		}
		function showMC() {
			$("#makeIconRight").hide();
			$('#makeIconDown').show();
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

		
		var MCvis = false;
		$("#makeButton").click(function() {
				if (!MCvis) {
					showMC();
					MCvis = true;
				}
				else {
					hideMC();
					MCvis = false;
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
					MCvis = false;
				}
				if ( $('#maker').is(':visible') ) {
					hideMaker();					
				}
		});
		
		
		*/
		
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
 
