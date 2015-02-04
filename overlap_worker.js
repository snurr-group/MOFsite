var overlap = '';

onmessage = function(e) {	
	var array = e.data[0];
	var atoms = e.data[1];
	var correction = e.data[2];
	var lengthA = array.length;
	var lengthB = atoms.length;
	var index = 0;
	var x1=0;
	var y1=0;
	var z1=0;
	var x2=0;
	var y2=0;
	var z2=0;
	var val=0;
	var dist=0;
	var flagged = [];
	var distArray = [];
	console.log(atoms);
	for (i=0;i<lengthA;i++) { // probes
		x1 = array[i][0];
		y1 = array[i][1];
		z1 = array[i][2];
		
		
		
		 if (!isInArray(i,flagged)) {
			// periodic boundary conditions 
		for (k=0;k<lengthB;k++) { // compare to coordinates of structure
			x2 = atoms[k]['x'];
			y2 = atoms[k]['y'];
			z2 = atoms[k]['z'];
			
			
			dist = distance(x1,y1,z1,x2,y2,z2);
			if (dist < 0.85) { // VDW radius of B is 0.85 A
				distArray[index] = dist;
				flagged[index] = i;
				val = correction + i + 1; 
				overlap += 'B' + val + ', ';
				index++;
			}
		}	
	} 	
		if (!isInArray(i,flagged)) {
			
		for (j=i+1;j<lengthA-1;j++) { // compare to coordinates of other probes
			x3 = array[j][0];
			y3 = array[j][1];
			z3 = array[j][2];
			
			dist = distance(x1,y1,z1,x3,y3,z3);
			if (dist < 0.85) { // VDW radius of B is 0.85
				distArray[index] = dist;
				flagged[index] = i;
				val = correction + j; 
				overlap += 'B' + val + ', ';
				index++;
			}
		}
	   }
	  }		
	
		
	
	
function distance(x1,y1,z1,x2,y2,z2) {
	return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2) + Math.pow(z1-z2,2));
}	
function isInArray(value, arr) {
  return arr.indexOf(value) > -1;
}
	overlap = overlap.slice(0,-2);
	overlap=overlap.split(',').filter(function(item,i,allItems){ // kill duplicates 
    return i==allItems.indexOf(item);
}).join(',');
	postMessage(overlap);
};

