import bpy

# Names of materials to assign
material_names = [f"Material.{i:03d}" for i in range(1, 8)]

for obj in bpy.context.selected_objects:
    if obj.type != 'MESH':
        continue

    # Ensure exactly 7 material slots
    mat_slots = obj.data.materials

    # Add slots if needed
    while len(mat_slots) < 7:
        mat_slots.append(None)

    # Remove extra slots if needed
    while len(mat_slots) > 7:
        mat_slots.pop(index=len(mat_slots) - 1)

    # Assign materials
    for i, mat_name in enumerate(material_names):
        mat = bpy.data.materials.get(mat_name)

        # Optional: create material if it doesn't exist
        if mat is None:
            mat = bpy.data.materials.new(name=mat_name)

        mat_slots[i] = mat
