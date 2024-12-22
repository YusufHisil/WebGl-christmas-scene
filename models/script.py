import json

def parse_obj_file(file_path):
    vertices = []  # v x y z
    normals = []   # vn x y z
    texcoords = [] # vt u v
    faces = []     # f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3
    
    with open(file_path, 'r') as file:
        for line in file:
            if line.startswith('#'): continue  # Skip comments
            
            values = line.split()
            if not values: continue
            
            if values[0] == 'v':  # Vertex
                vertices.append([float(x) for x in values[1:4]])
            elif values[0] == 'vn':  # Normal
                normals.append([float(x) for x in values[1:4]])
            elif values[0] == 'vt':  # Texture coordinate
                texcoords.append([float(x) for x in values[1:3]])
            elif values[0] == 'f':  # Face
                # Convert face indices to 0-based indexing
                face = []
                for v in values[1:]:
                    w = v.split('/')
                    # OBJ indices start at 1, so we subtract 1
                    vertex_idx = int(w[0]) - 1
                    texcoord_idx = int(w[1]) - 1 if w[1] else 0
                    normal_idx = int(w[2]) - 1 if len(w) > 2 else 0
                    face.append((vertex_idx, texcoord_idx, normal_idx))
                faces.append(face)
    
    # Create the combined vertex array in the required format
    combined_vertices = []
    indices = []
    vertex_map = {}  # To keep track of unique vertex combinations
    current_index = 0
    
    for face in faces:
        face_indices = []
        for vertex_idx, texcoord_idx, normal_idx in face:
            # Create a unique key for this vertex combination
            key = (vertex_idx, texcoord_idx, normal_idx)
            
            # If we haven't seen this combination before, add it to our vertices
            if key not in vertex_map:
                vertex = vertices[vertex_idx]
                normal = normals[normal_idx] if normals else [0, 1, 0]  # Default normal if none specified
                texcoord = texcoords[texcoord_idx] if texcoords else [0, 0]  # Default texcoord if none specified
                
                # Add to combined vertices array
                combined_vertices.extend(vertex)    # Position (x, y, z)
                combined_vertices.extend(normal)    # Normal (x, y, z)
                combined_vertices.extend(texcoord)  # Texture coordinates (u, v)
                
                vertex_map[key] = current_index
                current_index += 1
            
            face_indices.append(vertex_map[key])
        
        # Convert faces to triangles (assuming faces are convex)
        for i in range(1, len(face_indices) - 1):
            indices.extend([face_indices[0], face_indices[i], face_indices[i + 1]])
    
    return {
        "vertices": combined_vertices,
        "indices": indices
    }

def save_to_json(data, output_file):
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

# Example usage
if __name__ == "__main__":
    input_file = "gingerbread.obj"  # Replace with your .obj file
    output_file = "model.js"  # Output JSON file name
    
    model_data = parse_obj_file(input_file)
    save_to_json(model_data, output_file)