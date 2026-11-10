// Turn a model that faces +x to face +z (bake the rotation into the vertices), keep everything else.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { transformMesh } from '@gltf-transform/functions';
const [, , src, dst] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
const s = Math.SQRT1_2, q = [0, -s, 0, s];
// rotation matrix for -90 degrees about y: +x -> +z
const m = [0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1];
for (const mesh of doc.getRoot().listMeshes()) transformMesh(mesh, m);
await io.write(dst, doc);
console.log('rotated', src, '->', dst);
