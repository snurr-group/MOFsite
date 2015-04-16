$(function() {
	function initializeJmol(str) {
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
   script: "set antialiasDisplay;background white; load " + str + " {1 1 1}; set appendNew false; zoom 60; spacefill only;",       // script to run
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


//var myJmol2 = "<div id='jmolApplet0_appletinfotablediv' style='width:100%;height:100%;position:relative;font-size:14px;text-align:left'><div id='jmolApplet0_appletdiv' style='z-index:-1;width:100%;height:100%;position:absolute;top:0px;left:0px;'><script type='text/javascript'>jmolApplet0._cover(false)</script></div><div id='jmolApplet0_2dappletdiv' style='position:absolute;width:100%;height:100%;overflow:hidden;display:none'></div><div id='jmolApplet0_infotablediv' style='width:100%;height:100%;position:absolute;top:0px;left:0px'><div id='jmolApplet0_infoheaderdiv' style='height:20px;width:100%;background:yellow;display:none'><span id='jmolApplet0_infoheaderspan'></span><span id='jmolApplet0_infocheckboxspan' style='position:absolute;text-align:right;right:1px;'><a href='javascript:Jmol.showInfo(jmolApplet0,false)'>[x]</a></span></div><div id='jmolApplet0_infodiv' style='position:absolute;top:20px;bottom:0px;width:100%;height:100%;overflow:auto'></div></div></div>";
//console.log(myJmol);  
  $("#viewer2")
  .append(myJmol)
  .addClass("padded");

} // end initializeJmol

initializeJmol('./MOFs/Kr5.cif');
});
