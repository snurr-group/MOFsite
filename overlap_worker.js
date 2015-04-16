

onmessage = function(e) {	
	var overlap = [];
	var done = false;
	var overlapString = '';
	var array = e.data[0];
	var atoms = e.data[1];
	var correction = e.data[2];
	var probeRadius = parseFloat(e.data[3]);
	var cellSize = e.data[4]; // given as x,y,z lengths. Vector implementation to follow
	var adjustment = e.data[5]; // number of iterations
	var numProbes = e.data[6]; // total number of probes (user given)
	var triclinic = e.data[7];
	if (triclinic) {
	var cellMatrix = e.data[8];
	var inverseMatrix = e.data[9];
	for (i=0;i<cellMatrix.length;i++) {
	cellMatrix[i] = parseFloat(cellMatrix[i]);
}

for (i=0;i<inverseMatrix.length;i++) {
	inverseMatrix[i] = parseFloat(inverseMatrix[i]);
}
}
	var lengthA = array.length; // number of probes in this iteration (set to 500 on main thread)
	var lengthB = atoms.length; // number of structure atoms, useful for pinpointing probes
	var index = 0;
	var x1=0;
	var y1=0;
	var z1=0;
	var x2=0;
	var y2=0;
	var z2=0;
	var val=0;
	var dist=0;
	var radius=0;
	var pcb = false; 
	var atomDiameters = {
Ac:	3.098545742,
Ag:	2.804549165,
Al:	4.008153333,
Am:	3.012128566,
Ar:	3.445996242,
As:	3.768501578,
At:	4.231768911,
Au:	2.933729479,
B:	3.637539466,
Ba:	3.298997953,
Be:	2.445516981,
Bi:	3.893227398,
Bk:	2.97471082,
Br:	3.73197473,
C:	3.430850964,
Ca:	3.028164743,
Cd:	2.537279549,
Ce:	3.168035842,
Cf:	2.951547453,
Cl:	3.51637724,
Cm:	2.963129137,
Co:	2.558661118,
Cr:	2.693186825,
Cu:	3.11369102,
Cs:	4.02418951,
Dy:	3.054000806,
Eu:	3.111909222,
Er:	3.021037553,
Es:	2.939074871,
F:	2.996983288,
Fe:	2.594297067,
Fm:	2.927493188,
Fr:	4.365403719,
Ga:	3.904809082,
Ge:	3.813046514,
Gd:	3.000546883,
H:	2.571133701,
He:	2.571133701,
Hf:	2.798312874,
Hg:	2.409881033,
Ho:	3.03707373,
I:	4.009044232,
In:	3.976080979,
Ir:	2.53015236,
K:	3.396105914,
Kr:	3.689211592,
La:	3.137745285,
Li:	2.183592758,
Lu:	3.242871334,
Lr:	2.882948252,
Md:	2.916802403,
Mg:	2.691405028,
Mn:	2.637951104,
Mo:	2.719022888,
N:	3.260689308,
Na:	2.657550876,
Ne:	2.657550876,
Nb:	2.819694443,
Nd:	3.184962917,
No:	2.893639037,
Ni:	2.524806967,
Np:	3.050437211,
O:	3.118145513,
Os:	2.779604001,
P:	3.694556984,
Pa:	3.050437211,
Pb:	3.828191792,
Pd:	2.582715384,
Pm:	3.160017753,
Po:	4.195242064,
Pr:	3.212580778,
Pt:	2.45353507,
Pu:	3.050437211,
Ra:	3.275834587,
Rb:	3.665157326,
Re:	2.631714813,
Rh:	2.609442345,
Rn:	4.245132392,
Ru:	2.639732902,
S:	3.594776328,
Sb:	3.937772334,
Sc:	2.935511276,
Se:	3.74622911,
Si:	3.826409994,
Sm:	3.135963488,
Sn:	3.91282717,
Sr:	3.243762233,
Ta:	2.824148937,
Tb:	3.074491476,
Tc:	2.670914357,
Te:	3.98231727,
Th:	3.025492047,
Ti:	2.82860343,
TI:	3.872736728,
Tm:	3.005892275,
U:	3.024601148,
V:	2.80098557,
W:	2.734168166,
Xe:	3.923517955,
Y:	2.980056212,
Yb:	2.988965199,
Zn:	2.461553158,
Zr:	2.783167595,
}	
	var flagged = [];
    var testvar = 0;
    var MCcalculate = function() {
		
		
		for (i=0;i<lengthA;i++) { // probes
				
		x1 = array[i][0];
		y1 = array[i][1];
		z1 = array[i][2];

		var fixedI = i + 500*adjustment;
		var dr = 0;
		for (k=0;k<lengthB;k++) { // compare to coordinates of structure
			
			if (!isInArray(fixedI,flagged)) {
			x2 = atoms[k]['x'];
			y2 = atoms[k]['y'];
			z2 = atoms[k]['z'];
			
			radius = atomDiameters[atoms[k]['sym']]/2;
			
			dist = distance(x1,y1,z1,x2,y2,z2);
			
			dist = pbCond(dist);
			
			dr = Math.sqrt(Math.pow(dist[0],2) + Math.pow(dist[1],2) + Math.pow(dist[2],2));			
			
			if (dr < (probeRadius + radius)) { 
				flagged[index] = fixedI;
				val = correction + i + 1 + 500*adjustment; 
				overlap[index] = 'B' + val;
				index++;
			}
		} // end if flagged 
		} // end for loop (structure)	
}		// end for loop (probes)
} // end function

MCcalculate();



function vectMag(vector) {
	return Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2) + Math.pow(vector[2],2));
}

// distance vector between points
function distance(x1,y1,z1,x2,y2,z2) {
	var distanceVector = [Math.abs(x1-x2),  Math.abs(y1-y2),   Math.abs(z1-z2)]; // return distance vector
	return distanceVector;
}			
function matrixDotVector(m,v) {
	sX = m[0]*v[0] + m[3]*v[1] + m[6]*v[2];
	sY = m[1]*v[0] + m[4]*v[1] + m[7]*v[2];
	sZ = m[2]*v[0] + m[5]*v[1] + m[8]*v[2];
	return [sX, sY, sZ];
}

function pbCond(dist,probePt) {
	
			if (triclinic) {
		
	fractional = [0,0,0];	
	fractional = matrixDotVector(inverseMatrix, dist);
	//console.log(dist);
	xVect = [0,0,0];
	xVect[0] = fractional[0] - Math.round(fractional[0]);
	xVect[1] = fractional[1] - Math.round(fractional[1]);
	xVect[2] = fractional[2] - Math.round(fractional[2]);
	//console.log(xVect);
	//console.log(cellMatrix);
	cartesian = matrixDotVector(cellMatrix,xVect);
	//console.log(cartesian);
	return cartesian;
			
				
				
			} // end if triclinic
			
			else {
			if (dist[0] > cellSize[0]/2) {
					dist[0] = dist[0] - cellSize[0]; 
			}
			if (dist[1] > cellSize[1]/2) {
					dist[1] = dist[1] - cellSize[1]; 
			}
			if (dist[2] > cellSize[2]/2) {
					dist[2] = dist[2] - cellSize[2]; 
			}
		return dist;
		}
			
		}

function isInArray(value, arr) {
  return arr.indexOf(value) > -1;
}	

	overlap=overlap.filter(function(item,i,allItems){ // kill duplicates 
    return i==allItems.indexOf(item);
}).join(',');
if (500*(adjustment+1)>=numProbes) {
	done = true;
}
	postMessage([overlap,done]);
};

