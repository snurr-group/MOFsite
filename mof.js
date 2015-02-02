	$(function() {
		
		
	var name = "DOTSOV";
	var nameString = "./MOFs/" + name + ".cif";

		
	 var Info = {
 color: "#FFFFFF", // white background (note this changes legacy default which was black)
   height: "120%",      // pixels (but it may be in percent, like "100%")
   width: "100%",
  use: "HTML5",     // "HTML5" or "Java" (case-insensitive)
   j2sPath: "./jsmol/j2s",          // only used in the HTML5 modality
   jarPath: "java",               // only used in the Java modality
   jarFile: "JmolApplet0.jar",    // only used in the Java modality
   isSigned: false,               // only used in the Java modality
   serverURL: "php/jsmol.php",  // this is not applied by default; you should set this value explicitly
  // src: initialMOF,          // file to load
   script: "set antialiasDisplay;background white; set appendNew false; load ./MOFs/DOTSOV.cif {1 1 1}; animation mode palindrome; animation on;",       // script to run
   defaultModel: "",   // name or id of a model to be retrieved from a database
   addSelectionOptions: false,  // to interface with databases
   debug: false
 };	 

var myJmol = Jmol.getAppletHtml("jmolApplet0", Info);
$(document).ready(function() {
  $("#viewer")
  .append(myJmol)
  .addClass("padded");
})

$.getJSON("MOF-database.json", function(data) {
			MOFdata = data;
			
		});
		$.getJSON("Blocks-database.json", function(data) {
			blockdata = data;
		});
		
var test = '';
$.ajax({
	url: "./chxinv.xyz",
	dataType: "text",
	success: function(data) {
		test=data;
	}
});  

// RegExp work
var exp = /0.[1-9]+/gi;
var str = "S1 0.12939 29120";
var arr = str.match(exp);
console.log(arr);




//////



// for drag and drop functionality
/*
var hashArray = [];
hashArray[0] = [];
hashArray[1] = [];
hashArray[2] = [];
//$(".drag").draggable();
$("#infoBox").droppable({
		drop: function(event, ui) {
			 var thisType = ui.draggable.attr("type");
			 var thisHash = ui.draggable.attr("hash");
			 switch (thisType) {
			 	case "cn" :
			 		hashArray[0] += thisHash;
			 	break;
			 	case "bb" : 
			 		hashArray[1] += thisHash;
			 	break;
			 	case "ln" :
			 		hashArray[2] += thisHash;
			 	break;
			 }
		}

	}); */
	
	
		$("#accordion").accordion();
		
		$("#supercellSelector").submit(function(event) {
			event.preventDefault();
			
		});
		$("#submitSupercell").click(function() {
			var x = $('input[name=x]:checked').val();
			var y = $('input[name=y]:checked').val();
			var z = $('input[name=z]:checked').val();
			loadSupercell(x, y, z); 
			console.log(name);
		});
		
		var cellA = 0;
		$("#runSimulation").click(function() {
			console.log('simulation');
			Jmol.script(jmolApplet0, 'define MOF C*,H*,N*,O*; define nah A*');
			
			//Jmol.script(jmolApplet0, 'set autobond off; load APPEND ./MOFs/Nitrogens.cif;');
			
			// get cell length
			var modelInfo = Jmol.getPropertyAsArray(jmolApplet0, "fileInfo");
			//console.log(modelInfo['models'][0]['_cell_length_a']);
			cellA = modelInfo['models'][0]['_cell_length_a'];
			/////
			var coordinates = '';
			var inlineString = '';
			for (i=1;i<=10;i++) {
				coordinates = getRandomCo();
				
				inlineString+= i + ' B ' + coordinates + '\n';
				console.log(inlineString);
				//Jmol.script(jmolApplet0, 'load APPEND INLINE "  B ' + coordinates + ' ";');
			}
			
		//	Jmol.script(jmolApplet0, 'load APPEND INLINE' + inlineString + ';');
		
		//console.log(caffeine);
		//jmolLoadInline(caffeine);
		Jmol.script(jmolApplet0, 'console; var q = "24\n" + "Caffeine\n" + "H      -3.3804130    -1.1272367     0.5733036\n" + "N       0.9668296    -1.0737425    -0.8198227\n" + "C       0.0567293     0.8527195     0.3923156\n" + "N      -1.3751742    -1.0212243    -0.0570552\n" + "C      -1.2615018     0.2590713     0.5234135\n" + "C      -0.3068337    -1.6836331    -0.7169344\n" + "C       1.1394235     0.1874122    -0.2700900\n" +  "N       0.5602627     2.0839095     0.8251589\n" +  "O      -0.4926797    -2.8180554    -1.2094732\n" + "C      -2.6328073    -1.7303959    -0.0060953\n" + "O      -2.2301338     0.7988624     1.0899730\n" + "H       2.5496990     2.9734977     0.6229590\n" + "C       2.0527432    -1.7360887    -1.4931279\n" + "H      -2.4807715    -2.7269528     0.4882631\n" + "H      -3.0089039    -1.9025254    -1.0498023\n" + "H       2.9176101    -1.8481516    -0.7857866\n" + "H       2.3787863    -1.1211917    -2.3743655\n" + "H       1.7189877    -2.7489920    -1.8439205\n" + "C      -0.1518450     3.0970046     1.5348347\n" + "C       1.8934096     2.1181245     0.4193193\n" + "N       2.2861252     0.9968439    -0.2440298\n" + "H      -0.1687028     4.0436553     0.9301094\n" + "H       0.3535322     3.2979060     2.5177747\n" +  "H      -1.2074498     2.7537592     1.7203047\n"; load APPEND "@q";');
		return true;
			//Jmol.script(jmolApplet0,'console; print "testing"; var x = script("select *;").lines.length; print x; ');
			
		});
		function getRandomCo() {
			var rX = Math.random() * cellA;
			var rY = Math.random() * cellA;
			var rZ = Math.random() * cellA;
			var coords = rX + ' ' + rY + ' ' + rZ;
			console.log(coords);
			return coords; 
		}
		
		$("#remove").click(function() {
			var a = 'A';
			var string = '';
			var num1 = 0;
			var num2 = 0;
			var num3 = 0;
		/*	for (i=1;i<=10;i++) {
				a += i.toString();
				num1 = (i/1).toFixed(5);
				num1 = num1.toString();
				string += a + '    N      ' + num1 + '   ' + num2 + '   ' + num3 + '   Uiso  1.00   <br />';
					
				for (j=1;j<=10;j++) {
					string += a + '_' + j.toString() + '    N      ' + num1 + '   ' + num2 + '   ' + num3 + '   Uiso  1.00   <br />';
					num2 = (j/1).toFixed(5);
					num2 = num2.toString();
					
					for (k=1;k<=10;k++) {
						string += a + '_' + k.toString() + '    N      ' + num1 + '   ' + num2 + '   ' + num3 + '   Uiso  1.00   <br />';
						num3 = (k/1).toFixed(5);
						num3 = num3.toString();
						
					}
				}
				
				
				
							
				a = 'A';
				
			}
			$('#addme').append(string);
			 */
			
			console.log('remove');
			// check overlap with MOF then with other N
			//////////////////
			Jmol.script(jmolApplet0, 'console; print "testing"; select *; select on B* and within(0.8, O*, C*, H*); var x = {selected}.length; print x;');
			//////////////////
			
			
			
			//Jmol.script(jmolApplet0, 'console; print getPropertyAsArray("modelInfo");');
			
			
			//Jmol.script(jmolApplet0, 'define overL within(1.8, TRUE, C*,H*,O*); hide overL;');
			
			
			// zap to remove atoms
			//Jmol.script(jmolApplet0, 'define MOF *; restrict MOF;');
		});
		
		$("#spacefill").click(function() {
			Jmol.script(jmolApplet0,'select *; cartoons off; spacefill only;');
		}); 
		
				$("#ballStick").click(function() {
			Jmol.script(jmolApplet0,'select *; cartoons off; spacefill 23%; wireframe 0.15;');		
		}); 
		

		
		$('#generate').click(function() {
			if (true) {
				// add a new file OVERLAYED!
				Jmol.script(jmolApplet0, 'load APPEND ./MOFs/DOTSOV.cif;');
			}
			
			

			else {
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
		 }
		});
		
		function loadViewer(name) {
			name = name.toString();
			Jmol.script(jmolApplet0,'load ./MOFs/' + name + '.cif');
		}
		
		function loadSupercell(x,y,z) {
			Jmol.script(jmolApplet0, 'load ./MOFs/' + name + '.cif {' + x + ' ' + y + ' ' + z + '}');
		}
		
		function clearAll() {
			$(".buildBlock").removeClass("selected");
			hashArray = [];	
			
		}
		
		$("#infoBox").hide();
		$("#maker").hide()
		$('#clear').click(function() {
			clearAll();
			$("#mofFail").hide();	
		});
		
		$("#makeButton").click(function() {
			
				if ( $('#maker').is(':visible') ) {
					
					$("#makeIconDown").hide();
					$('#makeIconRight').show();
					
					$("#maker").slideUp("slow");
				}
				else {
					$("#makeIconRight").hide();
					$('#makeIconDown').show();
				
					$("#maker").slideDown("slow");
					
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
