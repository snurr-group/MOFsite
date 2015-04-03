

onmessage = function(e) {	
	var atoms = e.data[0];
	var numProbes = e.data[1];
	var cellSize = e.data[2];	
	var stepSize = 0;

	
	
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
	
	
	
	
	var cellVol = cellSize[0]*cellSize[1]*cellSize[2];
	var gridSize = Math.floor(Math.pow(numProbes, 1/3));
	var unitResolution = cellSize[0] / gridSize;
	stepSize = unitResolution;
	var points = [];
		
// generate grid of evenly spaced points
	for (i=0;i<=gridSize;i++) { 
		for (j=0;j<=gridSize;j++) {
			for (k=0;k<=gridSize;k++) {
				index = i + gridSize*j + Math.pow(gridSize,2)*k;
				points[index] = [unitResolution*i, unitResolution*j, unitResolution*k];
	}
	}
	}

	var atomX = [];
	var atomY = [];
	var atomZ = [];
	for (l=0;l<atoms.length;l++) {
		atomX[l] = atoms[l]['x'];
		atomY[l] = atoms[l]['y'];
		atomZ[l] = atoms[l]['z'];
	}


	var pointsa = []; // grid of points outside of structure atoms
	var p = 0; // counter
	for (m=0;m<points.length;m++) {
		x1 = points[m][0];
		z1 = points[m][1];
		y1 = points[m][2];
			
		if (!checkOverlap([x1,y1,z1], 0)) {
			pointsa[p] = points[m];
			p++;
		}			
	}
	

	// now we have a grid of points outside of any structure atoms, next we find the largest possible probe at each point
	
	var rada = [];
	var flagged = false; 
	var increments = 100;
	
	for (n=0;n<pointsa.length;n++) {		
		flagged = false;
		for (o=0;o<increments;o++) { // increments of stepSize each
			if (!flagged) {
			testRad = o*stepSize;
			if (checkOverlap(pointsa[n],testRad,n)) {
				rada[n] = testRad;
				flagged = true;
			}
			
		}
	}
	}
	console.log(rada);
	
	// now have two arrays, pointsa with the locations of grid points and rada with the radii of the largest sphere at each point
	
	// next, we generate random points outside of the structure, compare to pointsa and find largest containing sphere
	
	function randomCoords() {
		var pt = [];
		
		x1 = Math.random()*cellSize[0]/1;
		y1 = Math.random()*cellSize[1]/1;
		z1 = Math.random()*cellSize[2]/1;
		
		pt = [x1, y1, z1];
		
		if (checkOverlap(pt,0)) {
			return randomCoords();
		}
		else {
			return pt;
		}
		}
	
	var maxDist = 0;
	var probeSizeArray = []; // bin this array up to max probe size at point
	var probePoint = [0, 0, 0];
		for (w=0;w<increments;w++) {
		probeSizeArray[w]=0;
	}


	for (s=0;s<numProbes;s++) {
		maxDist = 0;
		probePoint = randomCoords(); // generates a point outside of structure
		

		for (t=0;t<pointsa.length;t++) {
			dist = distance(probePoint[0], probePoint[1], probePoint[2], pointsa[t][0], pointsa[t][1], pointsa[t][2]);
			dist = pbCond(dist);
			dr = Math.sqrt(Math.pow(dist[0],2) + Math.pow(dist[1],2) + Math.pow(dist[2],2));
			if (dr < rada[t] && dr > maxDist) { // if probe is within sphere AND this is the largest sphere
				maxDist = rada[t]*2;				
			}
			
		}
		binArray(maxDist);
	}
	
	
	function binArray(max) {
		maxIndex = Math.floor(max/stepSize);
		for (u=0;u<maxIndex;u++) {
			probeSizeArray[u]++;	
		}
	}
	
	
	
	function checkOverlap(pt, r,a) {
		x = pt[0];
		y = pt[1];
		z = pt[2];
		
		var overlap = false;
		var flag = false;
		
		for (b=0;b<atoms.length;b++) {
			if (!flag) {
		xa = atomX[b];
		ya = atomY[b];
		za = atomZ[b];
			
		
		radius = atomDiameters[atoms[b]['sym']]/2;
		
		
		dist = distance(x,y,z,xa,ya,za);	
		dist = pbCond(dist);	
		dr = Math.sqrt(Math.pow(dist[0],2) + Math.pow(dist[1],2) + Math.pow(dist[2],2));
		//console.log(dist);
			if (dr < (radius+r)) {
				overlap = true;
				flag = true;
				}
				else {
					overlap = false;
				}
							
		}
			

		} 
		return overlap;
		}// 


function distance(x1,y1,z1,x2,y2,z2) {
	var distanceVector = [Math.abs(x1-x2),  Math.abs(y1-y2),   Math.abs(z1-z2)]; // return distance vector
	return distanceVector;
}	
function pbCond(dist) {
			
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

function isInArray(value, arr) {
  return arr.indexOf(value) > -1;
}	

console.log(probeSizeArray);
postMessage([probeSizeArray, stepSize]);


};

