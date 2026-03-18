import { Stack, Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins'
import { Colors, Fonts } from '../constants/colors'
import { useUserStore } from '../store/userStore'
import { ConnectionProvider } from '../hooks/useConnection'

// Register WebRTC globals for LiveKit — must be called once before any Room usage
import { registerGlobals } from '@livekit/react-native'
registerGlobals()

export default function RootLayout() {
  const onboarded = useUserStore((s) => s.onboarded)

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  })

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    )
  }

  return (
    <ConnectionProvider>
      {!onboarded && <Redirect href="/onboarding" />}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="profile" />
        <Stack.Screen name="tour/overview" />
        <Stack.Screen name="tour/map" />
        <Stack.Screen name="tour/camera" />
        <Stack.Screen name="tour/story" />
        <Stack.Screen name="tour/assistant" />
        <Stack.Screen name="tour/history" />
        <Stack.Screen name="tour/completion" />
      </Stack>
    </ConnectionProvider>
  )
}
