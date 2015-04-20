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

var atoms = e.data[0];
var numProbes = e.data[1]/1;
var cellSize = e.data[2];
var triclinic = e.data[3];
var structureCount = atoms.length;

if (triclinic) {
	var cellMatrix = e.data[6];
	var probeCoords = e.data[5];
	var inverseMatrix = e.data[4];
	for (i=0;i<cellMatrix.length;i++) {
	cellMatrix[i] = parseFloat(cellMatrix[i]);
}

for (i=0;i<inverseMatrix.length;i++) {
	inverseMatrix[i] = parseFloat(inverseMatrix[i]);
}
}


var step = 0.05; // resolution of point location
var stepSize = 0.01; // resolution of radius 
var probeSizeArray = [];
	var atomX = [];
	var atomY = [];
	var atomZ = [];
	for (l=0;l<atoms.length;l++) {
		atomX[l] = atoms[l]['x'];
		atomY[l] = atoms[l]['y'];
		atomZ[l] = atoms[l]['z'];
	}
var up = [];
var down = [];
var extraChance = false;
var flag2 = false;
var tempR = 0;

for (p=0;p<1000;p++) {
	probeSizeArray[p] = 0;
}

for (q=0;q<numProbes;q++) {
	extraChance = false;
	if (triclinic) {
		
	probePoint = probeCoords[q];
	probePoint[0] = +probePoint[0]; 
	probePoint[1] = +probePoint[1]; 
	probePoint[2] = +probePoint[2];	
	}
	else {
	probePoint = randomCoords();
	}
	//console.log(probePoint);
	r = largestRadius(probePoint,0);
	//console.log(r);
	testPointArray = incrementPoint(probePoint);
	//console.log(testPointArray);
	probeSize = findPore(testPointArray,r);
	//console.log('pore size is ' + probeSize);
	probeSizeArray = binArray(probeSize,probeSizeArray);
	//console.log(probeSizeArray);
}



function findPore(pointArray,r) {
	var direction = -1;
	flag2 = false;
	for (j=0;j<pointArray.length;j++) {
		largestTest = largestRadius(pointArray[j],r); 
		if ((largestTest > r)) {
			r = largestTest;
			direction = j;
		}
	}
		if (direction != -1) {
			//console.log(direction);
			newPoint = incrementPoint(pointArray[direction]);
			//console.log(newPoint);
			if (extraChance) {
		//		console.log(r);
				return r;
			}
			else {
				return findPore(newPoint,r);
			}
		}
	
		else {
			if (extraChance) {
				return r;
			}
			else { // failed to find a larger probe, given another chance
				extraChance = true;
			
				for (k=0;k<pointArray.length;k++) {
					if (!flag2) { 
					newPoint = incrementPoint(pointArray[k]);
					if (findPore(newPoint,r) > (r+0.011)) { // 0.01 is resolution
						flag2 = true; // exit for loop
						
						var rr = findPore(newPoint,r);
						extraChance = false;
						//console.log('excess recursion with radius ' + rr);
						return rr;
					}
				}
				}
				
			if (!flag2) {
			return r;
			}
		} // end else (if not extraChance)
	} // end else (if not -1)
} // end findPore()

function distanceBetweenPoints(pt1,pt2) {
	d = distance(pt1[0],pt1[1],pt1[2],pt2[0],pt2[1],pt2[2]);
	d = pbCond(d);
	dr = Math.sqrt(Math.pow(dist[0],2) + Math.pow(dist[1],2) + Math.pow(dist[2],2));
	return dr;
}

function incrementPoint(point) { // six directions, + x,y,z; - x,y,z
	pointArray = [];
	for (j=0;j<3;j++) {
		up[j] = point[j] + step;
		down[j] = point[j] - step;
	}
	pointArray[0] = [up[0], point[1], point[2]];
	pointArray[1] = [point[0], up[1], point[2]];
	pointArray[2] = [point[0], point[1], up[2]];
	pointArray[3] = [down[0], point[1], point[2]];
	pointArray[4] = [point[0], down[1], point[2]];
	pointArray[5] = [point[0], point[1], down[2]];
	
	return pointArray;	
}

function largestRadius(point,startingRadius) {
	i=startingRadius;
	while (!checkOverlap(point,i)) {
		i+=stepSize;
	}
	return i;
}

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


	function binArray(max,arr) {
		maxIndex = Math.round(max/stepSize); // floor and round interchangeable? 
		for (u=0;u<maxIndex;u++) {
			arr[u]++;	
		}
		
		return arr;
	}

function checkOverlap(pt, r) {
	
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
		
		
		distR = distance(x,y,z,xa,ya,za);	
		distR = pbCond(distR,pt);	
		dr = Math.sqrt(Math.pow(distR[0],2) + Math.pow(distR[1],2) + Math.pow(distR[2],2));
		
			
			
			if (dr < (radius+r)) {
				overlap = true;
				flag = true;
			}
				else {
					overlap = false;
				}
				
				/*
		if (distR == -1) {
					overlap = true;
				}
		else {
					dr = vectMag(distR);
						if (dr < (radius+r)) { // check if overlap
							overlap = true; // flag
					} // end if
				}
				*/		
									
		}
		} 
		return overlap;
		} // end checkOverlap 

function distance(x1,y1,z1,x2,y2,z2) {
	var distanceVector = [Math.abs(x1-x2),  Math.abs(y1-y2),   Math.abs(z1-z2)]; // return distance vector
	return distanceVector;
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

function matrixDotVector(m,v) {
	sX = m[0]*v[0] + m[3]*v[1] + m[6]*v[2];
	sY = m[1]*v[0] + m[4]*v[1] + m[7]*v[2];
	sZ = m[2]*v[0] + m[5]*v[1] + m[8]*v[2];
	return [sX, sY, sZ];
}


/*
// periodic boundary calculations, needs fixing for triclinic
function pbCond(dist,probePt,rad) {
	//console.log(probePt);
	function minOverlap(probePt) {
				probeX1 = probePt[0];
				probeY1 = probePt[1];
				probeZ1 = probePt[2];
		overlapPBC = false; 
	for (h=0;h<structureCount;h++) { // compare to rest of structure
		if (!overlapPBC) { // if the probe has not overlapped with any structure atoms
				
				// structure atom coordinates
				xb = atoms[h]['x'];
				yb = atoms[h]['y'];
				zb = atoms[h]['z'];
				
				// structure atom radius
				sym = atoms[h]['sym'];
				compareRad = atomDiameters[sym]/2;
				
				// distance between probe and atom
				
				distP = distance(probeX1, probeY1, probeZ1, xb, yb, zb);
				dr = vectMag(distP);
				if (dr < (rad + compareRad - 0.001)) { // check if overlap
							overlapPBC = true; // flag
					} // end if
			}
		}
		return overlapPBC;
			} // end minOverlap function
			
			
			
			
			if (triclinic && false) {
			
			pbcFlag = false;
			
				for (p=0;p<6;p++) {
					if (!pbcFlag) {
						if (pointToPlane(probePt,planes[p]) > rad) {
						newPoint = shiftPoint(probePt,p,shiftArray);
						if (minOverlap(newPoint)) {
							pbcFlag = true;
						}
					}
					else {
						console.log('distance of: ' + pointToPlane(probePt,planes[p]) + ' at point ' + probePt);
					}
				}
				}
				
				if (pbcFlag) { // overlap occured due to PBC
					return -1;	
				}
				else {
					return dist;
				}
				
				
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
		 */
		
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

// magnitude of vector
function vectMag(vector) {
	return Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2) + Math.pow(vector[2],2));
}

// distance vector between points
function distance(x1,y1,z1,x2,y2,z2) {
	var distanceVector = [Math.abs(x1-x2),  Math.abs(y1-y2),   Math.abs(z1-z2)]; // return distance vector
	return distanceVector;
}			
		
console.log(stepSize);		
postMessage([probeSizeArray,stepSize*2]);

} 
