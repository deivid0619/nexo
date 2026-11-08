# Crea la animación propia "Colgar_Loop" (colgado de un cable) sobre el esqueleto de
# Universal Animation Library (Quaternius, CC0). No existe un clip gratis de colgarse.
#
# Uso:
#   blender --background --python scripts/blender/colgar.py -- <UAL1_Standard.glb> <salida colgar.glb>
#
# Cada hueso se orienta hacia una dirección del mundo (brazos arriba, piernas que se balancean),
# así no depende de cómo vienen girados los huesos en reposo. Se exporta solo el esqueleto con la
# acción; scripts/preparar-corredor.mjs copia sus rotaciones al corredor.
import math
import sys

import bpy
from mathutils import Matrix, Quaternion, Vector

argumentos = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
if len(argumentos) != 2:
    print('Uso: blender --background --python scripts/blender/colgar.py -- <UAL1_Standard.glb> <salida.glb>')
    sys.exit(1)
ORIGEN, SALIDA = argumentos

NOMBRE = 'Colgar_Loop'
CUADROS = 24  # 1 s a 24 cuadros por segundo
PASO = 2
# Cuánto se doblan los dedos (grados por falange) para agarrar el cable.
CIERRE = 70

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=ORIGEN)
esqueleto = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
for accion in list(bpy.data.actions):
    bpy.data.actions.remove(accion)
if esqueleto.animation_data:
    esqueleto.animation_data_clear()

escena = bpy.context.scene
escena.render.fps = 24
escena.frame_start = 0
escena.frame_end = CUADROS
bpy.context.view_layer.objects.active = esqueleto
bpy.ops.object.mode_set(mode='POSE')
huesos = esqueleto.pose.bones
for pb in huesos:
    pb.rotation_mode = 'QUATERNION'


def reposo():
    for pb in huesos:
        pb.location = (0, 0, 0)
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.scale = (1, 1, 1)
    bpy.context.view_layer.update()


# Direcciones del personaje en el espacio del esqueleto, medidas en reposo.
reposo()
a_esqueleto = esqueleto.matrix_world.inverted().to_3x3()
ARRIBA = (a_esqueleto @ Vector((0, 0, 1))).normalized()
adelante = huesos['ball_l'].head - huesos['foot_l'].head
adelante = (adelante - ARRIBA * adelante.dot(ARRIBA)).normalized()
ADELANTE = adelante
IZQUIERDA = (huesos['upperarm_l'].head - huesos['upperarm_r'].head)
IZQUIERDA = (IZQUIERDA - ARRIBA * IZQUIERDA.dot(ARRIBA) - ADELANTE * IZQUIERDA.dot(ADELANTE)).normalized()
ABAJO = -ARRIBA


def girar(v, eje, grados):
    return (Matrix.Rotation(math.radians(grados), 3, eje) @ v).normalized()


def apuntar(nombre, direccion):
    """Gira el hueso (con su pose actual) para que su eje apunte hacia `direccion`."""
    pb = huesos[nombre]
    actual = pb.matrix.copy()
    eje = actual.to_3x3() @ Vector((0, 1, 0))
    giro = eje.normalized().rotation_difference(direccion.normalized())
    nueva = Matrix.Translation(actual.translation) @ giro.to_matrix().to_4x4() @ actual.to_3x3().to_4x4()
    pb.matrix = nueva
    bpy.context.view_layer.update()


def pose(t):
    """t de 0 a 1: un vaivén completo."""
    reposo()
    fase = math.sin(2 * math.pi * t)
    # Torso: casi vertical, se arquea un poco al ir hacia adelante.
    apuntar('spine_01', girar(ARRIBA, IZQUIERDA, -4 * fase))
    apuntar('spine_02', girar(ARRIBA, IZQUIERDA, -6 * fase))
    apuntar('spine_03', girar(ARRIBA, IZQUIERDA, -6 * fase))
    apuntar('neck_01', girar(ARRIBA, IZQUIERDA, 8))
    apuntar('Head', girar(ARRIBA, IZQUIERDA, 12))
    # Brazos arriba, casi rectos, las manos juntas sobre la cabeza agarrando el cable.
    for lado, signo in (('l', 1), ('r', -1)):
        apuntar(f'clavicle_{lado}', (ARRIBA * 0.5 + IZQUIERDA * signo).normalized())
        apuntar(f'upperarm_{lado}', (ARRIBA + ADELANTE * 0.1 - IZQUIERDA * 0.12 * signo).normalized())
        apuntar(f'lowerarm_{lado}', (ARRIBA + ADELANTE * 0.06 - IZQUIERDA * 0.36 * signo).normalized())
        apuntar(f'hand_{lado}', (ARRIBA + ADELANTE * 0.2 - IZQUIERDA * 0.1 * signo).normalized())
        # Dedos cerrados alrededor del cable.
        for dedo in ('index', 'middle', 'ring', 'pinky'):
            for parte in ('01', '02', '03'):
                huesos[f'{dedo}_{parte}_{lado}'].rotation_quaternion = Quaternion((1, 0, 0), math.radians(CIERRE))
        for parte in ('02', '03'):
            huesos[f'thumb_{parte}_{lado}'].rotation_quaternion = Quaternion((1, 0, 0), math.radians(CIERRE * 0.6))
        bpy.context.view_layer.update()
    # Piernas: se balancean juntas, con las rodillas algo dobladas y un leve desfase.
    for lado, desfase in (('l', 6), ('r', -6)):
        angulo = 22 * fase + desfase
        muslo = girar(ABAJO, IZQUIERDA, angulo)  # positivo: la pierna va hacia adelante
        apuntar(f'thigh_{lado}', muslo)
        apuntar(f'calf_{lado}', girar(muslo, IZQUIERDA, -28 - 8 * max(0.0, -fase)))
        apuntar(f'foot_{lado}', girar(ADELANTE, IZQUIERDA, -35))


TOCADOS = [
    'spine_01', 'spine_02', 'spine_03', 'neck_01', 'Head',
    'clavicle_l', 'upperarm_l', 'lowerarm_l', 'hand_l',
    'clavicle_r', 'upperarm_r', 'lowerarm_r', 'hand_r',
    'thigh_l', 'calf_l', 'foot_l', 'thigh_r', 'calf_r', 'foot_r',
] + [f'{d}_{p}_{l}' for d in ('index', 'middle', 'ring', 'pinky') for p in ('01', '02', '03') for l in ('l', 'r')] + [
    f'thumb_{p}_{l}' for p in ('02', '03') for l in ('l', 'r')
]

accion = bpy.data.actions.new(NOMBRE)
accion.use_fake_user = True
esqueleto.animation_data_create()
esqueleto.animation_data.action = accion
for cuadro in range(0, CUADROS + 1, PASO):
    pose(cuadro / CUADROS)
    for nombre in TOCADOS:
        huesos[nombre].keyframe_insert('rotation_quaternion', frame=cuadro)

bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT')
esqueleto.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=SALIDA,
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_animation_mode='ACTIONS',
    export_force_sampling=True,
    export_def_bones=False,
)
print(f'Listo: {SALIDA} con la animación {NOMBRE}.')
