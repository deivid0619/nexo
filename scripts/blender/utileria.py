# Crea la utilería propia de NEXO: la pistola del corredor y el dron de la zona de armas.
#
# Uso:
#   blender --background --python scripts/blender/utileria.py -- public/modelos/utileria.glb
#
# Bajo detalle, bordes biselados y sin texturas. Las dos piezas comparten un material de metal
# oscuro que toma el color de los vértices (así el ojo del dron y la franja de la pistola llevan
# el celeste de la torre sin otra textura ni otro material).
#
# Ejes en el juego (glTF, Y arriba): el mundo avanza hacia +x.
# - pistola: el cañón apunta a +x y la empuñadura está en el origen (se cuelga de hand_r).
# - dron: plano y horizontal, con el ojo mirando a -x (hacia el corredor que llega).
import math
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

argumentos = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
if len(argumentos) != 1:
    print('Uso: blender --background --python scripts/blender/utileria.py -- <salida utileria.glb>')
    sys.exit(1)
SALIDA = argumentos[0]


def color(hexa, alfa=1.0):
    """#RRGGBB a RGBA lineal (los colores de vértice del glTF son lineales)."""
    def lineal(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lineal(int(hexa[1:3], 16)), lineal(int(hexa[3:5], 16)), lineal(int(hexa[5:7], 16)), alfa)


METAL = color('#2B3036')
METAL_CLARO = color('#48505A')
CELESTE = color('#7FD6DC')

bpy.ops.wm.read_factory_settings(use_empty=True)

material = bpy.data.materials.new('metal_utileria')
nodos = material.node_tree.nodes
principal = nodos.get('Principled BSDF')
principal.inputs['Metallic'].default_value = 0.55
principal.inputs['Roughness'].default_value = 0.45
atributo = nodos.new('ShaderNodeVertexColor')
atributo.layer_name = 'Col'
material.node_tree.links.new(atributo.outputs['Color'], principal.inputs['Base Color'])


def pieza(nombre, bm, tinte, biselar=0.0):
    """Convierte un bmesh en un objeto con su color de vértice y, si se pide, bordes biselados."""
    if biselar > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges) + list(bm.verts), offset=biselar, segments=1, affect='EDGES')
    malla = bpy.data.meshes.new(nombre)
    bm.to_mesh(malla)
    bm.free()
    capa = malla.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
    for dato in capa.data:
        dato.color = tinte
    objeto = bpy.data.objects.new(nombre, malla)
    bpy.context.scene.collection.objects.link(objeto)
    malla.materials.append(material)
    return objeto


def caja(centro, tamano, tinte, biselar=0.0, giro_z=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(tamano), verts=bm.verts)
    bmesh.ops.transform(bm, matrix=Matrix.Rotation(giro_z, 4, 'Z'), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(centro), verts=bm.verts)
    return pieza('parte', bm, tinte, biselar)


def cilindro(centro, radio, largo, eje, tinte, lados=10):
    """Cilindro con su eje a lo largo de 'x', 'y' o 'z' (ejes de Blender)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=lados, radius1=radio, radius2=radio, depth=largo)
    giro = {'x': Matrix.Rotation(1.5707963, 4, 'Y'), 'y': Matrix.Rotation(1.5707963, 4, 'X'), 'z': Matrix.Identity(4)}[eje]
    bmesh.ops.transform(bm, matrix=giro, verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(centro), verts=bm.verts)
    return pieza('parte', bm, tinte)


def esfera(centro, radio, aplastar, tinte):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=radio)
    bmesh.ops.scale(bm, vec=Vector(aplastar), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(centro), verts=bm.verts)
    return pieza('parte', bm, tinte)


def unir(nombre, partes):
    bpy.ops.object.select_all(action='DESELECT')
    for p in partes:
        p.select_set(True)
    bpy.context.view_layer.objects.active = partes[0]
    bpy.ops.object.join()
    objeto = bpy.context.view_layer.objects.active
    objeto.name = nombre
    objeto.data.name = nombre
    bpy.ops.object.shade_flat()
    return objeto


# Pistola (en Blender Z es arriba; el exportador lo pasa a Y). Unos 0,25 m de largo.
pistola = unir('pistola', [
    caja((0.06, 0, 0.055), (0.17, 0.035, 0.05), METAL, 0.006),        # cuerpo
    cilindro((0.175, 0, 0.065), 0.012, 0.07, 'x', METAL_CLARO),        # cañón
    caja((0.06, 0.0185, 0.055), (0.11, 0.002, 0.012), CELESTE),        # franja derecha
    caja((0.06, -0.0185, 0.055), (0.11, 0.002, 0.012), CELESTE),       # franja izquierda
    caja((0.0, 0, -0.01), (0.035, 0.03, 0.09), METAL, 0.005),          # empuñadura (en el origen)
    caja((0.04, 0, 0.012), (0.03, 0.012, 0.02), METAL_CLARO),          # guardamonte
])

# Dron: cuerpo, cuatro brazos con rotores y un ojo. Unos 0,8 m de ancho.
partes_dron = [
    esfera((0, 0, 0), 0.16, (1.0, 1.0, 0.55), METAL),                  # cuerpo
    caja((0, 0, -0.07), (0.16, 0.16, 0.04), METAL_CLARO, 0.01),        # panza
    esfera((-0.15, 0, 0), 0.055, (0.6, 1.0, 1.0), CELESTE),            # ojo, mira a -x
]
for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
    brazo = Vector((sx, sy, 0)).normalized()
    centro_brazo = brazo * 0.2
    largo = 0.24
    partes_dron.append(caja((centro_brazo.x, centro_brazo.y, 0.02), (largo, 0.035, 0.025), METAL_CLARO, 0.0, math.atan2(sy, sx)))
    punta = brazo * 0.32
    partes_dron.append(cilindro((punta.x, punta.y, 0.05), 0.012, 0.05, 'z', METAL))       # eje del rotor
    partes_dron.append(cilindro((punta.x, punta.y, 0.08), 0.08, 0.008, 'z', METAL_CLARO, 14))  # rotor
dron = unir('dron', partes_dron)
# Medido arriba a 0,61 m de punta a punta de los rotores: se lleva a unos 0,8 m.
dron.scale = (1.3, 1.3, 1.3)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

bpy.ops.object.select_all(action='DESELECT')
pistola.select_set(True)
dron.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=SALIDA,
    export_format='GLB',
    use_selection=True,
    export_animations=False,
    export_vertex_color='ACTIVE',
    export_image_format='NONE',
)
print(f'Listo: {SALIDA} con la pistola y el dron.')
