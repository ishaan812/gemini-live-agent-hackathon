import React, { useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera'
import { Colors, Fonts } from '../constants/colors'

interface Props {
  onCapture: (base64: string) => void
}

export function CameraViewComponent({ onCapture }: Props) {
  const cameraRef = useRef<ExpoCameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()

  if (!permission) {
    return <View style={styles.container} />
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is required to verify landmarks</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      })
      if (photo?.base64) {
        onCapture(photo.base64)
      }
    }
  }

  return (
    <View style={styles.container}>
      <ExpoCameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <View style={styles.frame} />
        </View>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            accessibilityLabel="Take photo"
            accessibilityRole="button"
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </ExpoCameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 12,
  },
  controls: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
})
