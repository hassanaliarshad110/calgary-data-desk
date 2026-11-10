
 OVERVIEW
 ────────────────────────────────────────────
| key                | value                                        |
| ---                | ---                                          |
| version            | 2.0                                          |
| generator          | glTF-Transform v4.5.1                        |
| extensionsUsed     | EXT_texture_webp, KHR_draco_mesh_compression |
| extensionsRequired | EXT_texture_webp, KHR_draco_mesh_compression |



 SCENES
 ────────────────────────────────────────────
| #   | name  | rootName | bboxMin               | bboxMax                 | renderVertexCount¹ | uploadVertexCount | uploadNaiveVertexCount |
| --- | ---   | ---      | ---                   | ---                     | ---                | ---               | ---                    |
| 0   | Scene | Armature | -0.00471, 0, -0.00175 | 0.00471, 0.018, 0.00175 | 34,986             | 7,225             | 7,225                  |

¹ Expected number of vertices processed by the vertex shader for one render
  pass, without considering the vertex cache.

² Expected number of vertices uploaded to GPU, assuming each Accessor
  is uploaded only once. Actual number uploaded may be higher, 
  dependent on the implementation and vertex buffer layout.

³ Expected number of vertices uploaded to GPU, assuming each Primitive
  is uploaded once, duplicating vertex attributes shared among Primitives.



 MESHES
 ────────────────────────────────────────────
| #   | name                                            | mode      | meshPrimitives | glPrimitives | vertices | indices | attributes                                                                        | instances | size¹     |
| --- | ---                                             | ---       | ---            | ---          | ---      | ---     | ---                                                                               | ---       | ---       |
| 0   | tripo_mesh_18dcebab-83b8-4289-860a-a9acb53d6998 | TRIANGLES | 1              | 11,662       | 7,225    | u16     | JOINTS_0:u8, NORMAL:f32, POSITION:f32, TANGENT:f32, TEXCOORD_0:f32, WEIGHTS_0:f32 | 1         | 561.27 KB |

⁴ size estimates GPU memory required by a mesh, in isolation. If accessors are
  shared by other mesh primitives, but the meshes themselves are not reused, then
  the sum of all mesh sizes will overestimate the asset's total size. See "dedup".



 MATERIALS
 ────────────────────────────────────────────
| #   | name                                                | instances | textures                                                  | alphaMode | doubleSided |
| --- | ---                                                 | ---       | ---                                                       | ---       | ---         |
| 0   | tripo_material_18dcebab-83b8-4289-860a-a9acb53d6998 | 1         | baseColorTexture, normalTexture, metallicRoughnessTexture | OPAQUE    | ✓           |



 TEXTURES
 ────────────────────────────────────────────
| #   | name                                          | uri | slots                    | instances | mimeType   | compression | resolution | size     | gpuSize⁵ |
| --- | ---                                           | --- | ---                      | ---       | ---        | ---         | ---        | ---      | ---      |
| 0   | NormalGL_18dcebab-83b8-4289-860a-a9acb53d6998 |     | normalTexture            | 1         | image/webp |             | 1024x1024  | 12.83 KB | 5.59 MB  |
| 1   | Color_18dcebab-83b8-4289-860a-a9acb53d6998    |     | baseColorTexture         | 1         | image/webp |             | 1024x1024  | 41.04 KB | 5.59 MB  |
| 2   | ORM_18dcebab-83b8-4289-860a-a9acb53d6998      |     | metallicRoughnessTexture | 1         | image/webp |             | 1024x1024  | 29.71 KB | 5.59 MB  |

⁵ gpuSize estimates minimum VRAM memory allocation. Older devices may require
  additional memory for GPU compression formats.



 ANIMATIONS
 ────────────────────────────────────────────
| #   | name                     | channels | samplers | duration | keyframes | size      |
| --- | ---                      | ---      | ---      | ---      | ---       | ---       |
| 0   | Armature|clip0|baselayer | 72       | 72       | 0        | 72        | 856 Bytes |


