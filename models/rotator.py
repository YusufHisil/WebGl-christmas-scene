import json
import math
import numpy as np

def create_rotation_matrix(angle_x, angle_y, angle_z):
    """
    Create a 3D rotation matrix from Euler angles (in degrees)
    """
    # Convert angles to radians
    angle_x = math.radians(angle_x)
    angle_y = math.radians(angle_y)
    angle_z = math.radians(angle_z)
    
    # Rotation matrices for each axis
    Rx = np.array([
        [1, 0, 0],
        [0, math.cos(angle_x), -math.sin(angle_x)],
        [0, math.sin(angle_x), math.cos(angle_x)]
    ])
    
    Ry = np.array([
        [math.cos(angle_y), 0, math.sin(angle_y)],
        [0, 1, 0],
        [-math.sin(angle_y), 0, math.cos(angle_y)]
    ])
    
    Rz = np.array([
        [math.cos(angle_z), -math.sin(angle_z), 0],
        [math.sin(angle_z), math.cos(angle_z), 0],
        [0, 0, 1]
    ])
    
    # Combined rotation matrix (order: Z * Y * X)
    return Rz @ Ry @ Rx

def rotate_model(model_data, angle_x, angle_y, angle_z):
    """
    Rotate a 3D model by given angles around each axis
    Parameters:
    - model_data: Dictionary containing 'vertices' and 'indices'
    - angle_x, angle_y, angle_z: Rotation angles in degrees
    """
    # Create rotation matrix
    rotation_matrix = create_rotation_matrix(angle_x, angle_y, angle_z)
    
    # Get the vertices array
    vertices = model_data['vertices']
    new_vertices = vertices.copy()
    
    # Process each vertex (stride of 8 values per vertex: 3 position + 3 normal + 2 texture)
    for i in range(0, len(vertices), 8):
        # Extract position and normal
        position = np.array(vertices[i:i+3])
        normal = np.array(vertices[i+3:i+6])
        
        # Rotate position
        rotated_position = rotation_matrix @ position
        
        # Rotate normal
        rotated_normal = rotation_matrix @ normal
        # Normalize the rotated normal
        rotated_normal = rotated_normal / np.linalg.norm(rotated_normal)
        
        # Update the vertex data
        new_vertices[i:i+3] = rotated_position
        new_vertices[i+3:i+6] = rotated_normal
        # Texture coordinates (i+6:i+8) remain unchanged
    
    return {
        "vertices": new_vertices,
        "indices": model_data['indices']
    }

def load_model(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def save_model(model_data, file_path):
    with open(file_path, 'w') as f:
        json.dump(model_data, f, indent=2)

# Example usage
if __name__ == "__main__":
    # Load the model
    input_file = "gingerbread.json"
    output_file = "model_rotated.json"
    
    # Example rotation angles in degrees
    angles = {
        'x': 0,  # rotation around X axis
        'y': 0,  # rotation around Y axis
        'z': 90    # rotation around Z axis
    }
    
    # Load, rotate, and save the model
    model = load_model(input_file)
    rotated_model = rotate_model(model, angles['x'], angles['y'], angles['z'])
    save_model(rotated_model, output_file)
    
    print(f"Model rotated and saved to {output_file}")
    print(f"Applied rotations: X: {angles['x']}°, Y: {angles['y']}°, Z: {angles['z']}°")