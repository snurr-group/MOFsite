onmessage = function(e) {
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

var numProbes = e.data[0]/1;
var probeRad = e.data[1]/2;
//var increment = e.data[2];
var atomInfo = e.data[2];
var cellInfo = e.data[3];

var stepSize = e.data[4]; // size to increment probe by on each iteration


var numStructureAtoms = atomInfo.length;

var probeX = 0;
var probeY = 0;
var probeZ = 0;

var probeCount = [];
var probeCoords = [0, 0, 0];

var iterations = 500;

for (p=0;p<iterations;p++) {
	probeCount[p] = 0;
}

for (i=0;i<numProbes;i++) {
	overlap = false; 
	
	

	
	probeCoords = generateProbeCoords();
	probeX = probeCoords[0]; 
	probeY = probeCoords[1]; 
	probeZ = probeCoords[2]; 
	
	flag = false; 
	
	for (inc=0;inc<iterations;inc++) {	

		
	if (!flag) {
	probeRad = probeRad + (inc-1)*stepSize; // using inc-1 to generate false values of less than probe size by one increment. Probe size smaller than increment OK, values discarded
	
	for (j=0;j<numStructureAtoms;j++) {
	if (!overlap) {
	x2 = atomInfo[j]['x'];
	y2 = atomInfo[j]['y'];
	z2 = atomInfo[j]['z'];
	
	atomRad = atomDiameters[atomInfo[j]['sym']]/2;
	dist = [Math.abs(x2-probeX), Math.abs(y2-probeY), Math.abs(z2-probeZ)];
	dist = pbCond(dist);
	dr = Math.sqrt(Math.pow(dist[0],2) + Math.pow(dist[1],2) + Math.pow(dist[2],2));
	totalRad = atomRad + probeRad;
	overlap = dr < totalRad; 	

	
	} // end compare to structure for loop 
		
	if (overlap) {
		overlap = false;
		flag = true;
		if (inc!=0) {
			for (q=0;q<inc;q++) {
			probeCount[q]++;
		}
			
		}
		
	} // end if overlap
}
} // end if flag
} // end increment for loop	



} // end all probes for loop



function generateProbeCoords() {
	
	pX = Math.random()*cellInfo[0];
	pY = Math.random()*cellInfo[1];
	pZ = Math.random()*cellInfo[2];
	var oc = false;
	oc = occupiedSpace(pX,pY,pZ); 
	if (oc) {
		return generateProbeCoords();
	}
	else {
		return [pX,pY,pZ];
	}
}

function occupiedSpace(x,y,z) {
	var occupied = false;
	for (k=0;k<numStructureAtoms;k++) {
		if (!occupied) {
		xs = atomInfo[k]['x'];
		ys = atomInfo[k]['y'];
		zs = atomInfo[k]['z'];
		
		atomRad = atomDiameters[atomInfo[k]['sym']]/2;
		dist = [Math.abs(xs-x), Math.abs(ys-y), Math.abs(zs-z)];
		dist = pbCond(dist);
		occupied = Math.sqrt(Math.pow(dist[0],2) + Math.pow(dist[1],2) + Math.pow(dist[2],2)) < (atomRad); 		
	}
	}
	return occupied;
}

function pbCond(dist) {
			
			if (dist[0] > cellInfo[0]/2) {
					dist[0] = dist[0] - cellInfo[0]; 
			}
			if (dist[1] > cellInfo[1]/2) {
					dist[1] = dist[1] - cellInfo[1]; 
			}
			if (dist[2] > cellInfo[2]/2) {
					dist[2] = dist[2] - cellInfo[2]; 
			}
			return dist;
		}
				
postMessage([probeCount]);
};
