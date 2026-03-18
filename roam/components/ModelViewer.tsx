import React, { useCallback, useRef } from 'react'
import { StyleSheet, View, PanResponder } from 'react-native'
import { GLView } from 'expo-gl'
import { Renderer } from 'expo-three'
import {
  Scene,
  PerspectiveCamera,
  SpotLight,
  PointLight,
  AmbientLight,
  Color,
  CircleGeometry,
  MeshStandardMaterial,
  Mesh,
  Box3,
  Vector3,
  ACESFilmicToneMapping,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'

interface Props {
  modelAsset: number
  accentColor: string
  width: number
  height: number
  fitScale?: number
  yOffset?: number
}

export default function ModelViewer({
  modelAsset,
  accentColor,
  width,
  height,
  fitScale = 2.2,
  yOffset = 0,
}: Props) {
  // Shared rotation value mutated by pan gestures, read by render loop
  const rotationRef = useRef(0)

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        rotationRef.current += gestureState.dx * 0.008
      },
    })
  ).current

  const onContextCreate = useCallback(
    async (gl: any) => {
      // Patch pixelStorei: only forward parameters that expo-gl actually supports
      const _originalPixelStorei = gl.pixelStorei.bind(gl)
      const SUPPORTED_PIXEL_STORE = new Set([
        gl.UNPACK_ALIGNMENT,
        gl.PACK_ALIGNMENT,
      ])
      gl.pixelStorei = (pname: number, param: any) => {
        if (SUPPORTED_PIXEL_STORE.has(pname)) {
          _originalPixelStorei(pname, param)
        }
        // silently skip unsupported params (UNPACK_FLIP_Y, UNPACK_PREMULTIPLY_ALPHA, etc.)
      }

      // Suppress noisy THREE.WebGLProgram info log warnings
      const _origWarn = console.warn
      const _origLog = console.log
      console.warn = (...args: any[]) => {
        if (typeof args[0] === 'string' && args[0].includes('Program Info Log')) return
        _origWarn(...args)
      }
      console.log = (...args: any[]) => {
        if (typeof args[0] === 'string' && args[0].includes('gl.pixelStorei')) return
        _origLog(...args)
      }

      const renderer = new Renderer({ gl })
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight)
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2

      const scene = new Scene()

      const camera = new PerspectiveCamera(
        50,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        100
      )
      camera.position.set(0, 1.6, 4.0)
      camera.lookAt(0, 1.0, 0)

      // -- Lighting: dramatic spotlight from top --
      const color = new Color(accentColor)

      const spotLight = new SpotLight(0xffffff, 5)
      spotLight.position.set(0, 6, 2)
      spotLight.target.position.set(0, 0, 0)
      spotLight.angle = Math.PI / 5
      spotLight.penumbra = 0.6
      spotLight.decay = 1.5
      spotLight.castShadow = true
      scene.add(spotLight)
      scene.add(spotLight.target)

      const accentLight = new PointLight(color.getHex(), 1.5, 10)
      accentLight.position.set(-2, 2, 2)
      scene.add(accentLight)

      const fillLight = new PointLight(0x4488ff, 0.5, 10)
      fillLight.position.set(2, 1, -1)
      scene.add(fillLight)

      const ambient = new AmbientLight(0xffffff, 0.25)
      scene.add(ambient)

      // Ground circle
      const groundGeom = new CircleGeometry(0.5, 32)
      const groundMat = new MeshStandardMaterial({
        color: 0x222233,
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
        opacity: 0.15,
      })
      const ground = new Mesh(groundGeom, groundMat)
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -0.01
      ground.receiveShadow = true
      scene.add(ground)

      // -- Load GLB model --
      try {
        const asset = Asset.fromModule(modelAsset)
        await asset.downloadAsync()

        let buffer: ArrayBuffer

        if (asset.localUri) {
          const file = new File(asset.localUri)
          buffer = await file.arrayBuffer()
        } else {
          throw new Error('Asset localUri not available')
        }

        const loader = new GLTFLoader()
        loader.parse(
          buffer,
          '',
          (gltf: any) => {
            const model = gltf.scene

            const box = new Box3().setFromObject(model)
            const size = box.getSize(new Vector3())
            const center = box.getCenter(new Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = fitScale / maxDim
            model.scale.setScalar(scale)
            model.position.x = -center.x * scale
            model.position.y = -box.min.y * scale + yOffset
            model.position.z = -center.z * scale

            model.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
              }
            })

            scene.add(model)
          },
          (error: any) => {
            console.warn('GLTF parse error:', error)
          }
        )
      } catch (e) {
        console.warn('Failed to load model:', e)
      }

      // -- Render loop: static by default, user drags to rotate --
      const render = () => {
        requestAnimationFrame(render)
        scene.rotation.y = rotationRef.current
        renderer.render(scene, camera)
        gl.endFrameEXP()
      }
      render()
    },
    [modelAsset, accentColor, fitScale, yOffset]
  )

  return (
    <View style={[styles.container, { width, height }]} {...panResponder.panHandlers}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} msaaSamples={4} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
    borderRadius: 20,
  },
  glView: {
    flex: 1,
  },
})
