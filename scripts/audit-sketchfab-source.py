"""Print per-object world bounds for a Blender scene, without changing the source."""
import bpy
import os
import sys
from mathutils import Vector

source = os.path.abspath(sys.argv[sys.argv.index('--') + 1])
if source.lower().endswith('.blend'):
    bpy.ops.wm.open_mainfile(filepath=source)
elif source.lower().endswith('.fbx'):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.fbx(filepath=source)
elif source.lower().endswith(('.glb', '.gltf')):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=source)
else:
    raise SystemExit('Unsupported source')
rows = []
for obj in bpy.context.scene.objects:
    if obj.type != 'MESH':
        continue
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    lo = [min(p[i] for p in points) for i in range(3)]
    hi = [max(p[i] for p in points) for i in range(3)]
    size = [hi[i] - lo[i] for i in range(3)]
    rows.append((max(size), obj.name, size, lo, hi))
for _, name, size, lo, hi in sorted(rows, reverse=True)[:30]:
    print('BOUNDS', name, 'size=', [round(x, 3) for x in size],
          'min=', [round(x, 3) for x in lo], 'max=', [round(x, 3) for x in hi])
print('MESHES', len(rows))
