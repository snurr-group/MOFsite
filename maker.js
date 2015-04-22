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
   script: "zap; set antialiasDisplay;background white; load " + str + "; set appendNew false; zoom 60; spacefill only;",       // script to run
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
name = "DOTSOV";
// name of initial load, subsequently name of loaded file
var nameString = "./MOFs/" + name + ".cif";
initializeJmol(nameString);


		$.getJSON("MOF-database.json", function(data) {
			MOFdata = data;
		});
		$.getJSON("Blocks-database.json", function(data) {
			blockdata = data;
		});
$(".buildBlock").click(function () {
		if ($("#mofFail").is(":visible")) {
			$("#mofFail").hide();
		}
		$(this).toggleClass("selected");
	});
	
	$('#generate').click(function() {
		var hashArray =[];
		i=0;
		$(".selected").each(function () {
			hashArray[i] = blockdata[$(this).attr('hash')];
			i++;
		}
		);
		hashArray = hashArray.sort();
		hash = hashArray.join('');
		mof = MOFdata[hash];
		if (mof == null) {
			$("#mofFail").show();
			clearAll();
		} else {
			loadViewer(mof['name']);
			$('#learnMore').attr('href',mof['link']);
		}
		$(".buildBlock").removeClass("selected");
	});
	function loadViewer(name) {
		name = name.toString();
		Jmol.script(jmolApplet0,'set autobond on; load ./MOFs/' + name + '.cif {1 1 1}; spacefill only;');
	}
	
	function clearAll() {
		$(".buildBlock").removeClass("selected");
		hashArray = [];
	}
	
	$('#clear').click(function() {
		clearAll();
		$("#mofFail").hide();
	});
	
});
