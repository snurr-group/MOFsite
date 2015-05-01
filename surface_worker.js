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

var probesPerAtom = e.data[0]; // total probes/number of atoms
var atomNumber = e.data[1]; // atom in question
var atomInfo = e.data[2]; // info for all atoms
var probeRad = e.data[3]/2; // half of probe diameter
var cellSize = e.data[4]; // unit cell dimensions (array) for PCB calculations
var triclinic = e.data[5];
var mass = 0;
if (triclinic) {
	var cellMatrix = e.data[6];
	var inverseMatrix = e.data[7];
	for (i=0;i<cellMatrix.length;i++) {
	cellMatrix[i] = parseFloat(cellMatrix[i]);
}

for (i=0;i<inverseMatrix.length;i++) {
	inverseMatrix[i] = parseFloat(inverseMatrix[i]);
}
}


var structureCount = atomInfo.length; // number of structure atoms (624 for DOTSOV)
var done = false;

if (atomNumber == structureCount-1) { // if this is the last iteration
	done = true; 
}

// coordinates for atom in question, each run considers a new atom
var x = atomInfo[atomNumber]['x'];
var y = atomInfo[atomNumber]['y'];
var z = atomInfo[atomNumber]['z'];

// radius of atom in question
var atomRad = atomDiameters[atomInfo[atomNumber]['sym']]/2;

// probe coordinates
var probeX = 0;
var probeY = 0;
var probeZ = 0;

// coordinates of structure atom being compared to probe
var xa = 0;
var ya = 0;
var za = 0;

// additional variables
var dist = 0;
var compareRad = 0;

var notOverlap = 0;
//var overlap = false; 
var overlapP = false;

var surfaceArea = 0;
var mag = 0;

var mass = 0;

for (i=0;i<probesPerAtom;i++) { // for each of the probes given per atom
	// random point of sphere
	//thetha = 0.0;
	//phi = 0.0;
	theta = 2*Math.PI*Math.random();
	phi = Math.acos(2*Math.random()-1.0);
	xu = Math.cos(theta)*Math.sin(phi);
	yu = Math.sin(theta)*Math.sin(phi);
	zu = Math.cos(phi);
	
	rad = atomRad + probeRad;
	
	probeX = x + rad*xu;
	probeY = y + rad*yu;
	probeZ = z + rad*zu;
	
	
	overlapP = probeOverlap([probeX,probeY,probeZ]);
	
	if (!overlapP) { // if probe has no overlaps
		notOverlap++; // increment number of non-overlapped	
	}
	
	if (i == probesPerAtom -1) { // on the last iteration of the for loop, compute the surface area
		totalRad = atomRad + probeRad; // sum of radii
		surfaceArea = 4*Math.PI*Math.pow(totalRad,2)*notOverlap/probesPerAtom; // surface area of sphere S with radius (r(probe) + r(atom)) * non-overlapping probe fraction
		}
} // end for loop

if (atomNumber == (atomInfo.length-1)) {
masses = e.data[8];
mass = computeMass();
}

function computeMass() {
	nA = 6.022*Math.pow(10,23);
	massGrams = 0;
	for (i=0;i<structureCount;i++) {
		sym = atomInfo[i]['sym'];
		m = parseFloat(masses[sym]);
		massGrams += m/nA;
	}
	return massGrams;
}

function matrixDotVector(m,v) {
	sX = m[0]*v[0] + m[3]*v[1] + m[6]*v[2];
	sY = m[1]*v[0] + m[4]*v[1] + m[7]*v[2];
	sZ = m[2]*v[0] + m[5]*v[1] + m[8]*v[2];
	return [sX, sY, sZ];
}

// check overlap with structure 
function probeOverlap(probePoint) {
	probeX = probePoint[0];
	probeY = probePoint[1];
	probeZ = probePoint[2];
		overlap = false; 
	for (j=0;j<structureCount;j++) { // compare to rest of structure
		if (!overlap) { // if the probe has not overlapped with any structure atoms
				
				// structure atom coordinates
				xa = atomInfo[j]['x'];
				ya = atomInfo[j]['y'];
				za = atomInfo[j]['z'];
				
				// structure atom radius
				sym = atomInfo[j]['sym'];
				compareRad = atomDiameters[sym]/2;
				
				// distance between probe and atom
				
				distR = distance(probeX, probeY, probeZ, xa, ya, za);
			
				distR = pbCond(distR,probePoint); // periodic boundary considerations 
				
				if (distR == -1) {
					overlap = true;
				}
				else {
					dr = vectMag(distR);
						if (dr < (probeRad + compareRad - 0.001)) { // check if overlap
							overlap = true; // flag
					} // end if
				}
								
				
			} // end if
	} // end compare to rest of structure loop
	return overlap;
} // end function

// periodic boundary calculations, needs fixing for triclinic
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

// shift a point along a vector
function shiftPoint(point,index,shift) {
					if (index<3) {
						for (g=0;g<point.length;g++) {
							point[g] += shift[index][g];
						}
					}
					else {
						for (g=0;g<point.length;g++) {
							point[g] -= shift[index%3][g];
						}
					}
					return point;
}

// distance from a point to a plane
function pointToPlane(pt,pl) {
	D = Math.abs((pl[0]*pt[0] + pl[1]*pt[1] + pl[2]*pt[2] + pl[3])/Math.sqrt(Math.pow(pl[0],2) + Math.pow(pl[1],2) + Math.pow(pl[2],2)));
	return D;
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

// matrix inversion 
// matrixArray format should be [a,b,c; d,e,f; g,h,i];
function inverse3x3(a,b,c,d,e,f,g,h,i) { 
	det = a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);
	inv = [det2(e,f,h,i), det2(c,b,i,h), det2(b,c,e,f), det2(f,d,i,g), det2(a,c,g,i), det2(c,a,f,d), det2(d,e,g,h), det2(b,a,h,g), det2(a,b,d,e)];
	for (i=0;i<inv.length;i++) {
		inv[i] = inv[i]/det;
	}
	return inv;
}
function det2(a,b,c,d) {
	return (a*d-b*c);
}

function matrixVectorMultiply(mat,vect) {
	var result = [];
	result[0] = mat[0]*vect[0] + mat[1]*vect[1] + mat[2]*vect[2];
	result[1] = mat[3]*vect[0] + mat[4]*vect[1] + mat[5]*vect[2];
	result[2] = mat[6]*vect[0] + mat[7]*vect[1] + mat[8]*vect[2];
	return result;
}
// vector difference
function vectorSubtract(v1,v2) {
			var resultantV = [];
				if (v1.length != v2.length) {
					console.log('coordinate vector lengths do not match ');
					return false;
				}
				else {
					for (i=0;i<v1.length;i++) {
						resultantV[i] = v1[i] - v2[i];
					}
				return resultantV;
				}
}

// magnitude of vector
function vectMag(vector) {
	return Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2) + Math.pow(vector[2],2));
}

// distance vector between points
function distance(x1,y1,z1,x2,y2,z2) {
	var distanceVector = [Math.abs(x1-x2),  Math.abs(y1-y2),   Math.abs(z1-z2)]; // return distance vector
	return distanceVector;
}	
postMessage([surfaceArea, done, mass]);
}
