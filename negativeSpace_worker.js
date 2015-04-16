 onmessage = function(e) {
	var atoms = e.data[0];
	var triclinic = e.data[1];
	if (triclinic) {
		var cellMatrix = e.data[2];
		var inverseMatrix = e.data[3];
	}
	 
	 
 }
