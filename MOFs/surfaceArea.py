"""
A script to examine a metal-organic framework.
"""
import sys
import re
import copy
import string
import numpy as np
import math

from operator import itemgetter
from itertools import groupby

# default global numbers
E = 1e-3
PI = np.pi
angstrom = 1e-10

vdW_UFF = {
'Ag': 2.8, 'Ac': 3.1, 'Al': 4.01, 'Am': 3.01, 'Sb': 3.94,
'Ar': 3.45, 'As': 3.77, 'At': 4.23, 'Ba': 3.3, 'Be': 2.18,
'Bi': 3.89, 'B': 3.64, 'Br': 3.73, 'Cd': 2.54, 'Cs': 4.02,
'Ca': 3.03, 'C': 3.43, 'Ce': 3.17, 'Cl': 3.52, 'Cr': 2.69,
'Co': 2.56, 'Cu': 3.11, 'Cm': 2.96, 'Dy': 3.05, 'Er': 3.02,
'Eu': 3.11, 'F': 3.0, 'Fr': 4.37, 'Gd': 3.0, 'Ga': 3.9,
'Ge': 3.81, 'Au': 2.93, 'Hf': 2.8, 'He': 2.10, 'Ho': 3.04,
'H': 2.57, 'In': 3.98, 'I': 4.01, 'Ir': 2.53, 'Fe': 2.59,
'Kr': 3.69, 'La': 3.14, 'Pb': 3.83, 'Li': 2.18, 'Lu': 3.24,
'Mg': 2.69, 'Mn': 2.64, 'Hg': 2.41, 'Mo': 2.72, 'Nd': 3.18,
'Ne': 2.66, 'Np': 3.05, 'Ni': 2.52, 'Nb': 2.82, 'N': 3.26,
'Os': 2.78, 'O': 3.12, 'Pd': 2.58, 'P': 3.69, 'Pt': 2.45,
'Pu': 3.05, 'Po': 4.20, 'K': 3.40, 'Pr': 3.21, 'Pm': 3.16,
'Pa': 3.05, 'Ra': 3.28, 'Rn': 4.25, 'Re': 2.63, 'Rh': 2.61,
'Rb': 3.67, 'Ru': 2.64, 'Sm': 3.14, 'Sc': 2.94, 'Se': 3.75,
'Si': 3.83, 'Na': 2.66, 'Sr': 3.24, 'S': 3.59, 'Ta': 2.82,
'Tc': 2.67, 'Te': 3.98, 'Tb': 3.07, 'Tl': 3.87, 'Th': 3.03,
'Tm': 3.01, 'Sn':3.91, 'Ti': 2.83, 'W': 2.73, 'U': 3.02,
'V': 2.8, 'Xe': 3.92, 'Yb': 2.99, 'Y': 2.98, 'Zn': 2.46,
'Zr': 2.78}

def get_box_matrix(cifname):
    global a_x, a_y, a_z, b_x, b_y, b_z, c_x, c_y, c_z, unit_cell_volume
    a_x = a
    a_y = 0.0
    a_z = 0.0
    b_x = b * np.cos(gamma_r)
    b_y = b * np.sin(gamma_r)
    b_z = 0.0
    c_x = c * np.cos(beta_r)
    c_y = (b * c * np.cos(alpha_r) - b_x * c_x) / b_y
    c_z = np.sqrt(c**2 - c_x**2 - c_y**2)
    t_matrix = np.matrix([[a_x, a_y, a_z], [b_x, b_y, b_z], [c_x, c_y, c_z]], float)
    crs = np.cross([b_x, b_y, b_z], [c_x, c_y, c_z])
    cell_matrix = t_matrix
    inverse_matrix = cell_matrix.I
    unit_cell_volume = a_x * crs[0] + a_y * crs[1] + a_z * crs[2]
    return cell_matrix, inverse_matrix, t_matrix, unit_cell_volume

def get_box_parameters(cifname):
    global a, b, c, alpha_r, beta_r, gamma_r
    content = open(cifname, 'r').readlines()
    for line in content:
        if "_cell_length_a" in line:
            a = float(line.split()[1])
        if "_cell_length_b" in line:
            b = float(line.split()[1])
        if "_cell_length_c" in line:
            c = float(line.split()[1])
        if "_cell_angle_alpha" in line:
            alpha_r = float(line.split()[1]) * PI / 180.0
        if "_cell_angle_beta" in line:
            beta_r = float(line.split()[1]) * PI / 180.0
        if "_cell_angle_gamma" in line:
            gamma_r = float(line.split()[1]) * PI / 180.0
    return a, b, c, alpha_r, beta_r, gamma_r

def get_atomic_coordinates(cifname):
    fn = open(cifname, 'r').readlines()
    tmp = []
    underscore = re.compile("[_]")
    commas = re.compile(",")
    loopMS = re.compile("loop_")
    for n_line, line in enumerate(fn):
        if re.search(underscore, line) is not None or not line.strip() or re.search(commas, line) is not None:
            continue
        else:
            start_pos = n_line
            break
    count = 0.0
    for n_line, line in enumerate(fn):
        if n_line > start_pos - 1:
            if re.search(loopMS, line) or not line.strip():
                break
            else:
                count += 1
                tmp += line.split('\n')
    tmp = filter(None, tmp)
    pos = np.zeros((count, 3), float)
    atom_type = np.zeros((count, 1), object)
    for index, line in enumerate(tmp):
        tmp2 = string.split(line)
        atom_type[index] = copy.deepcopy(tmp2[1])
        pos[index] = np.array([tmp2[2], tmp2[3], tmp2[4]], float)
    return atom_type, pos

def RandomNumberOnUnitSphere():
	thetha = 0.0
	phi = 0.0
	theta = 2*PI*np.random.random_sample()
	phi = np.arccos(2*np.random.random_sample()-1.0)
	x = np.cos(theta)*np.sin(phi)
	y = np.sin(theta)*np.sin(phi)
	z = np.cos(phi)
	return x,y,z

def RandomNumberOnUnitSphere_RASPA():
	ransq = 1.0
	ran1 = 0.0
	ran2 = 0.0
	while (ransq>=1.0):
		ran1 = 2.0*np.random.random_sample() - 1.0
		ran2 = 2.0*np.random.random_sample() - 1.0
		ransq = ran1*ran1 + ran2*ran2	
	ranh=2.0*np.sqrt(1.0 - ransq)
	x = ran1*ranh
	y = ran2*ranh
	z = 1.0 - 2.0*ransq
	return x,y,z

def _dot_product(unit_cell_matrix, atom_positions):
    s_x = unit_cell_matrix.item(0) * atom_positions[0] + unit_cell_matrix.item(3) * atom_positions[1] + unit_cell_matrix.item(6) * atom_positions[2]
    s_y = unit_cell_matrix.item(1) * atom_positions[0] + unit_cell_matrix.item(4) * atom_positions[1] + unit_cell_matrix.item(7) * atom_positions[2]
    s_z = unit_cell_matrix.item(2) * atom_positions[0] + unit_cell_matrix.item(5) * atom_positions[1] + unit_cell_matrix.item(8) * atom_positions[2]
    new_coord = np.array([s_x, s_y, s_z], float)
    return new_coord

def ApplyBoundaryConditions(vec2, pos):
	w = [0,0,0]
	x = [0,0,0]
	vec2 = copy.deepcopy(np.asarray(vec2))
	inverse_matrix2 = copy.deepcopy(np.asarray(inverse_matrix))
	fractional = _dot_product(inverse_matrix, vec2)
	# apply boundary conditions
	x[0] = fractional[0] - np.rint(fractional[0])
	x[1] = fractional[1] - np.rint(fractional[1])
	x[2] = fractional[2] - np.rint(fractional[2])
	cartesian = _dot_product(cell_matrix,x)
	return cartesian

def CheckSurfaceAreaOverlap(pAtom, pos, atom_type, vdW_pAtom, fAtom_b):
	well_depth_factor = 1.0
	fAtom_o = [0,0,0]
	distance = [0,0,0]
	# start enumerating all atoms in the object
	for i, elem in enumerate(pos):
		fAtom_o = copy.deepcopy(elem)
		if not np.array_equal(fAtom_o,fAtom_b):
			vdW_fAtom = vdW_UFF.get(atom_type[i][0])
			equilibrium_distance = well_depth_factor * 0.5 * (vdW_pAtom + vdW_fAtom)
			fAtom_o = _dot_product(cell_matrix,fAtom_o)
			distance[0] = pAtom[0] - fAtom_o[0]
			distance[1] = pAtom[1] - fAtom_o[1]
			distance[2] = pAtom[2] - fAtom_o[2]
			dr = ApplyBoundaryConditions(distance, pos)
			rr = (dr[0] * dr[0]) + (dr[1] * dr[1]) + (dr[2] * dr[2])
			if rr < (equilibrium_distance * equilibrium_distance):
				return True
	return False

def surface_area(object,probe_diameter=1.0,nSample=20,total=0,equilibrium_distance=0.0,InsertTypeOfAtoms=None):
	"""
	Computes geometric surface area
	"""
	probe = "C"
	total=0.0
	counted=0.0
	vec=[]
	examined_coordinates = []
	SurfaceAreaOfSingleAtom = 0.0
	SurfaceAreaAverage = 0.0
	SurfaceAreaCount = 0.0
	AvgFrameworkSA = 0.0
	well_depth_factor = 1.0
	inverse_matrix = object.get_reciprocal_cell()
	# start enumerating all atoms in the framework
	for i, elem in enumerate(object):
		total=0.0
		counted=0.0
		fAtom = object[i]
		if np.linalg.norm([fAtom.x, fAtom.y, fAtom.z]) not in examined_coordinates:
			# check atomType to see if we want to insert probes around the atom
			if InsertTypeOfAtoms is fAtom.symbol:
				vdW_fAtom = vdW_UFF.get(fAtom.symbol)
				# Lorentz rule of mixing hard spheres 
				equilibrium_distance = well_depth_factor * (0.5 * (probe_diameter + vdW_fAtom))
				# start MC sampling for a given #
				for attempt in range(nSample):
					total+=1
					# find a random number around the sphere
					vec=RandomNumberOnUnitSphere()
					# calculate the coordinates of the center of probe using vec and equilibrium distance
					pAtom[0]=fAtom.x+vec[0]*equilibrium_distance
					pAtom[1]=fAtom.y+vec[1]*equilibrium_distance
					pAtom[2]=fAtom.z+vec[2]*equilibrium_distance
					# store the x,y,z coordinates of probe in an array
					vec2=np.array([pAtom.x, pAtom.y, pAtom.z])
					# check for the overlap between probe and the other framework atoms
					overlap=CheckSurfaceAreaOverlap(pAtom, object, probe_diameter, fAtom)
					if not overlap:
						counted+=1
				print ("fraction of insertion near", fAtom.symbol, "is", counted/total)
				tmp=(counted/total)*4.0*PI*(equilibrium_distance * equilibrium_distance)
				SurfaceAreaAverage+=tmp
				tmp2 = np.array([fAtom.x, fAtom.y, fAtom.z])
				examined_coordinates.append(np.linalg.norm(tmp2))
	print ("Surf. Area in Ang^2: ", SurfaceAreaAverage)
	print ("volume of unit cell: ", object.get_volume())
	print ("Surf. Area in m^2/cm^3: ", 1e4*SurfaceAreaAverage/object.get_volume())

def default_surface_area(atom_type,pos,probe_diameter=1.0,nSample=20,total=0,equilibrium_distance=0.0):
	"""
	Computes geometric surface area
	"""
	total=0.0
	counted=0.0
	vec=np.zeros((1,3), float)
	SurfaceAreaOfSingleAtom = 0.0
	SurfaceAreaAverage = 0.0
	SurfaceAreaCount = 0.0
	AvgFrameworkSA = 0.0
	well_depth_factor = 1.0
	fractional_list = []
	# start enumerating all atoms in the framework
	for i, elem in enumerate(atom_type):
		total=0.0
		counted=0.0
		vdW_fAtom = vdW_UFF.get(elem[0])
		# Lorentz rule of mixing hard spheres 
		equilibrium_distance = well_depth_factor * 0.5 * (probe_diameter + vdW_fAtom)
		# start MC sampling for a given #
		for attempt in range(nSample):
			pAtom = np.array([0.0, 0.0, 0.0], float)
			total+=1
			# find a random number around the sphere
#			vec=RandomNumberOnUnitSphere_RASPA()
			vec=RandomNumberOnUnitSphere()
			# calculate the coordinates of the center of probe using vec and equilibrium distance
			fAtom_xyz=_dot_product(cell_matrix,pos[i])
			pAtom[0]=fAtom_xyz[0]+vec[0]*equilibrium_distance
			pAtom[1]=fAtom_xyz[1]+vec[1]*equilibrium_distance
			pAtom[2]=fAtom_xyz[2]+vec[2]*equilibrium_distance
			# check for the overlap between probe and the other framework atoms
			overlap=CheckSurfaceAreaOverlap(pAtom, pos, atom_type, probe_diameter, pos[i])
			if not overlap:
				counted+=1
		tmp=(counted/total)*4.0*PI*(equilibrium_distance * equilibrium_distance)
		SurfaceAreaAverage+=tmp
		fractional_list.append([elem[0], counted / total, tmp, 1.0e4*tmp/unit_cell_volume])
		print (i, " out of ", len(atom_type))
	fractional_list.sort(key=itemgetter(0))
	file_out = open('freq.txt', 'w')
	for index, items in groupby(fractional_list, itemgetter(0)):
		sum_area = 0.0
		for atom in items:
			sum_area += atom[2]
			file_out.write('\t'.join(str(i) for i in atom) + '\n')
	print ("VSA (m^2/cm3): ", 1.0e4*SurfaceAreaAverage/unit_cell_volume)

if __name__ == '__main__':
    cifname = sys.argv[-1]
    a, b, c, alpha_r, beta_r, gamma_r = get_box_parameters(cifname)
    cell_matrix, inverse_matrix, t_matrix, unit_cell_volume = get_box_matrix(cifname)
    atom_type, pos = get_atomic_coordinates(cifname)
    default_surface_area(atom_type,pos,probe_diameter=3.72, nSample=500)
