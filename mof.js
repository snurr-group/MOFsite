	$(function() {
	// VARIABLES 
	var name = "DOTSOV"; // name of initial load, subsequently name of loaded file
	var nameString = "./MOFs/" + name + ".cif"; // path to loaded file
	var cellA = 0;
	var cellB = 0;
	var cellC = 0;
	var probeNumber = 0;
	var currentNumber = 0;
	var demo = false;
	var loaded = true;
	var transf = [];
	var angle = [];
	var side = [];
	var isTriclinic = false;
	// non-orthorhombic lattice vectors
	var vectA = [];
	var vectB = [];
	var vectC = [];
	var cellVol = 0; 
	var cellMatrix = [];
	var inverseMatrix = [];
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


// magnitude of vector
function vectMag(vector) {
	return Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2) + Math.pow(vector[2],2));
}

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
		  function polarVect(r,t,p) {
			  return [r*Math.sin(p)*Math.cos(t), r*Math.sin(p)*Math.sin(t), r*Math.cos(p)];
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
  }
  
  function inverse3x3([a,b,c,d,e,f,g,h,i]) {
	  det = a*e*i+b*f*g+c*d*h-(c*e*g+b*d*i+a*f*h);
	  mat = [(e*i-f*h), -(b*i-c*h), (b*f-c*e), -(d*i-f*g), (a*i-c*g), -(a*f-c*d), (d*h-e*g), -(a*h-b*g), (a*e-b*d)];
	  for (i=0;i<mat.length;i++) {
		  mat[i] *= 1/det;
	  }
	  return mat;
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
		
	//	$("#boxSelector").hide();
		var flaggedProbeCount = 0;
		var firstRun = true;
		
		/////////////
		
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
		
		
		// see JMOL documentation for x = contact{ ...
		

		var molInfo = Jmol.getPropertyAsArray(jmolApplet0, "atomInfo");
		var adjustment = 0;
		var done = false; 
		var mode = $(this).attr('id');
		
		////////////////// For VOID FRACTION AND PORE SIZE DISTRIBUTION 
		if (mode == 'VF' || mode == 'PSD') {
			
				if (typeof(w) == "undefined" && mode == 'VF') {
					var worker = new Worker("overlap_worker.js");
				}
				if (typeof(w) == "undefined" && mode == 'PSD') {
					var worker = new Worker("poresize_worker_3.js");
				}
				
				var tricFunc = function() {	
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
				
		/*	if (i+2 < probeNumber && i%500 ==0) {
					setTimeout(function() {console.log('pause ' + i); }, 100);
					
				} */ 	
					
			}	
			loaded = false; 
		};
			
			if (!isTriclinic || demo) {
			var coordinates = '';
			var coordArray = [];
			
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
						worker.postMessage([coordinateArray.slice(start, end), molInfo, currentNumber, probeSize, [cellA, cellB, cellC], i, probeNumber]);
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
				
				var workerSA = new Worker("surface_worker_2.js");
				
				
				
				if (!isTriclinic) {
					cellVol = cellA*cellB*cellC;
				}
				else {
					cellVol = triclinicVol(vectA, vectB, vectC, angle);
				}
				
				var probeBound = Math.floor(probeNumber/currentNumber); // number of probes per atom
				var surfaceArea = 0;
				$("#addme").empty();
				//console.log([vectA, vectB, vectC]);
				for (j=0;j<currentNumber;j++) {
					workerSA.postMessage([probeBound, j, molInfo, probeSize, [cellA, cellB, cellC], isTriclinic, cellMatrix, inverseMatrix]);
					workerSA.onmessage = function(event) {
						surfaceArea +=event.data[0];
						//console.log(surfaceArea);
						done = event.data[1];
						if (done) {
							console.log(surfaceArea);
							surfaceArea = surfaceArea * 10000 / cellVol;
							$("#addme").append('<br /> The surface area is ' + surfaceArea.toFixed(2) + ' m^2 / cm^3.');
						}
					}	
				}
				} // end for SA
				

		function generateHistogram(rawData, minSize, stepSize) {
			
			
			var upper =  minSize + (rawData.indexOf(0) + 2)*stepSize;
			
			histOptions = {yaxis: {max: 1}, xaxis : {max: 30}};
			
			var data = [];
			var xval = 0;
			var yval = 0;
			var tmp = 0;
			for (i=0;i<rawData.length;i++) {
				xval = minSize + i*stepSize;
				
				/*
				if (i!=0 && i+1 < rawData.length) {
					m1 = (rawData[i] - rawData[i-1])/stepSize;
					m2 = (rawData[i+1] - rawData[i])/stepSize;
					yval = -1*(m1+m2)/2;
				}
				if (i==0) {
					yval = -1*(rawData[i+1] - rawData[i])/stepSize;
				}
				if (i+1 == rawData.length) {
					yval = -1*(rawData[i] - rawData[i-1])/stepSize;
				}
				*/
				
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
			
		//	cleanPSD(data,tmp,rawData.length,stepSize);
						
			for (j=0;j<rawData.length;j++) {
				data[j][1] = data[j][1]/tmp; // normalize
				}			
						
			var maxVal = Math.max.apply(null,data);
			
			$.plot($('#histogram'), [data], histOptions);

		}
	
		function cleanPSD(data,mag,ll,step) {
				var temp = [];
				var stepsPerA = Math.ceil(1/step);
				console.log(stepsPerA);
				
				for (j=0;j<ll;j++) {
				temp[j] = data[j][1];
				data[j][1] = data[j][1]/mag; // normalize
				}
				
				
				temp = smoothLocalMaxima(temp);
				temp = removeNoise(temp);
				console.log(temp);
				
				function removeNoise(array) {
					for (i=0;i<array.length;i++) {
						if (array[i] < 0.2) {
							array[i] = 0;
						}
					}
					return array;
				}
				
				
				function smoothLocalMaxima(array) {
					for (i=0;i<array.length;i++) {
						currentVal = array[i];
						prevArray = previousValues(array,i);
						nextArray = nextValues(array,i);
						gradient = grad2Points(array,i);
						localVariation = averageLocalGradients(prevArray,nextArray,gradient);
					}
					return array;
				}
				
				// reutrn the n previous values of an array, n is the number of values required for a 1A difference 
				function previousValues(arr,index) {
					if (index < stepsPerA) {
						for (i=0;i<index;i++) {
							prev[i] = arr[i];
						}
					}
					else {
						for (i=0;i<stepsPerA;i++) {
							prev[i] = arr[index-stepsPerA+i];
						}
					}
					return prev;
				}
				// return the n next values of an array
				function nextValues(arr,index) {
					if (index+stepsPerA > arr.length) {
						for (i=0;i<(arr.length-index-1);i++) {
							next[i] = arr[index+i+1];
						}
					}
					else {
						for (i=0;i<stepsPerA;i++) {
							next[i] = arr[index+i+1];
						}
					}
					return next;
				}
				function grad2Points(arr,index) {
					if (index!=0 && index!=(arr.length-1)) {
						grad = arr[index-1] - arr[index+1];
					}
					if (index == 0) {
						grad = arr[index+1] - arr[index];
					}
					if (index+1 == arr.length) {
						grad = arr[index] - arr[index-1];
					}
					return grad;
				}
				
				function averageLocalGradients(arr1, arr2, grad) {  // does not handle pores under 1A
					grad1 = 0;
					grad2 = 0;
					var localMax = true;
					for (i=1;i<arr1.length-1;i++) {
						if (localMax) {
						tmpGrad = grad2Points(arr1,i);
						if (tmpGrad > grad) {
							localMax = false;
						}
						grad1 += tmpGrad;
					}
				}
				for (i=1;i<arr2.length-1;i++) {
						if (loacalMax) {
						tmpGrad = grad2Points(arr2,i);
						if (tmpGrad > grad) {
							localMax = false;
						}
						grad2 += tmpGrad;
					}
				}
				if (localMax) {
					grad1 = grad1/arr1.length;
					grad2 = grad2/arr2.length;
					return (grad1+grad2)/2;
				}
				else {
					return -1;
				}
				}
				
			} // end cleanPSD
	
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
		
		
		}); // end of MC simulation
		
	
		
		
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
		
		clicked = false;
		$("#mcDemo").click(function() {
			demo = true; 
			$("#boxText").show();
			$("#boxRadio").show();
			name = "Kr5";
			
			if (clicked) {
			$("#mcDemo").html('"Sphere in a Box" Demonstration');
			Jmol.script(jmolApplet0, 'zap; load ./MOFs/DOTSOV.cif {1 1 1}; spacefill only;');
			clicked = false;
			}
			else {if (!clicked) {
			$("#mcDemo").html('Return');
			Jmol.script(jmolApplet0, 'zap; load ./MOFs/' + name + '.cif {1 1 1};');
			clicked = true;
			}
			}
	
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
 
