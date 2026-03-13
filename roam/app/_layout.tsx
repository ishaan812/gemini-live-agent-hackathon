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

// Register WebRTC globals for LiveKit — must be called once before any Room usage
try {
  const { registerGlobals } = require('@livekit/react-native')
  registerGlobals()
} catch {
  console.warn('LiveKit native module not linked — run `npx expo run:ios` to rebuild')
}

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
    <>
      {!onboarded && <Redirect href="/onboarding" />}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primaryLight },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontFamily: Fonts.semiBold },
          contentStyle: { backgroundColor: Colors.background },
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Roam', headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="tour/overview" options={{ title: 'Tour Stops' }} />
        <Stack.Screen name="tour/map" options={{ title: 'Tour Map' }} />
        <Stack.Screen name="tour/camera" options={{ title: 'Verify Landmark' }} />
        <Stack.Screen name="tour/story" options={{ title: 'Story' }} />
        <Stack.Screen name="tour/guide" options={{ title: 'Live Guide', headerShown: false }} />
        <Stack.Screen name="tour/history" options={{ title: 'See the Past' }} />
        <Stack.Screen
          name="tour/completion"
          options={{ title: 'Tour Complete', headerShown: false }}
        />
      </Stack>
    </>
  )
}
