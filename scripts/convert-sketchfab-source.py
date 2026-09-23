"""Run with Blender in background mode to turn a downloaded source model into GLB.

blender --background --python scripts/convert-sketchfab-source.py -- input.blend output.glb
"""

import bpy
import os
import sys

arguments = sys.argv[sys.argv.index("--") + 1:]
if len(arguments) != 2:
    raise SystemExit("Expected source model and output GLB paths")
source, destination = map(os.path.abspath, arguments)
suffix = os.path.splitext(source)[1].lower()

if suffix == ".blend":
    bpy.ops.wm.open_mainfile(filepath=source)
else:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    if suffix == ".fbx":
        bpy.ops.import_scene.fbx(filepath=source)
    elif suffix == ".dae":
        bpy.ops.wm.collada_import(filepath=source)
    else:
        raise SystemExit("Unsupported source format: " + suffix)

for image in bpy.data.images:
    if image.source != "FILE" or image.packed_file:
        continue
    if os.path.exists(bpy.path.abspath(image.filepath)):
        continue
    candidate = os.path.join(os.path.dirname(source), os.path.basename(image.filepath))
    if os.path.exists(candidate):
        image.filepath = candidate

objects = [obj for obj in bpy.context.scene.objects if obj.type in {"MESH", "ARMATURE"}]
if not any(obj.type == "MESH" for obj in objects):
    raise SystemExit("Source contains no meshes")
bpy.ops.object.select_all(action="DESELECT")
for obj in objects:
    obj.hide_set(False)
    obj.hide_render = False
    obj.select_set(True)
bpy.context.view_layer.objects.active = objects[0]
bpy.ops.export_scene.gltf(
    filepath=destination,
    export_format="GLB",
    use_selection=True,
    export_yup=True,
    export_apply=True,
)
print("Exported", len(objects), "scene objects to", destination)
