var overlap = '';

onmessage = function(e) {	
	var array = e.data[0];
	var correction = e.data[1];
	var length = array.length;
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
	for (i=0;i<length;i++) {
		x1 = array[i][0];
		y1 = array[i][1];
		z1 = array[i][2];
		if (!isInArray(i,flagged)) {
				for (j=i+1;j<length-1;j++) {
			x2 = array[j][0];
			y2 = array[j][1];
			z2 = array[j][2];
			
			dist = distance(x1,y1,z1,x2,y2,z2);
			if (dist < 1.7) { // VDW radius of B is 0.85
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
	postMessage(overlap);
};

