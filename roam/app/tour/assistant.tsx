import {
  Animated,
  Dimensions,
  StyleSheet,
  useAnimatedValue,
  View,
  ViewStyle,
} from 'react-native';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AudioSession,
  useIOSAudioManagement,
  useLocalParticipant,
  useParticipantTracks,
  useRoomContext,
  VideoTrack,
} from '@livekit/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ControlBar from '../../components/assistant/ControlBar';
import ChatBar from '../../components/assistant/ChatBar';
import ChatLog from '../../components/assistant/ChatLog';
import AgentVisualization from '../../components/assistant/AgentVisualization';
import { LocalVideoTrack, Track } from 'livekit-client';
import {
  TrackReference,
  useSessionMessages,
  useTrackToggle,
} from '@livekit/components-react';
import { useConnection } from '../../hooks/useConnection';
import { useUserStore, GUIDES, NarrationStyle } from '../../store/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/colors';

const MODEL_MAP: Record<NarrationStyle, number> = {
  historical: require('../../assets/models/arjun.glb'),
  funny: require('../../assets/models/maya.glb'),
  poetic: require('../../assets/models/luna.glb'),
  adventurous: require('../../assets/models/rex-v1.glb'),
};

export default function AssistantScreen() {
  // Start the audio session first.
  useEffect(() => {
    let start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <BlurView intensity={40} tint="dark" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <RoomView />
        </SafeAreaView>
      </BlurView>
    </LinearGradient>
  );
}

const RoomView = () => {
  const router = useRouter();
  const connection = useConnection();
  const room = useRoomContext();
  const { name, narrationStyle, language } = useUserStore();

  // Resolve the current guide's model and color
  const guide = useMemo(
    () => GUIDES.find((g) => g.id === narrationStyle) ?? GUIDES[0],
    [narrationStyle]
  );
  const modelAsset = MODEL_MAP[narrationStyle];
  const accentColor = guide.color;

  // Track room connection state
  const [isConnected, setIsConnected] = useState(room.state === 'connected');
  useEffect(() => {
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);
    const onStateChange = () => setIsConnected(room.state === 'connected');

    room.on('connected', onConnected);
    room.on('disconnected', onDisconnected);
    room.on('connectionStateChanged', onStateChange);

    // Sync initial state
    setIsConnected(room.state === 'connected');

    return () => {
      room.off('connected', onConnected);
      room.off('disconnected', onDisconnected);
      room.off('connectionStateChanged', onStateChange);
    };
  }, [room]);

  // Set participant attributes so the Python agent knows user preferences
  useEffect(() => {
    const setAttrs = () => {
      if (room.state === 'connected' && room.localParticipant) {
        const attrs = {
          'user.name': name || 'Explorer',
          'user.narrationStyle': narrationStyle,
          'user.language': language,
        };
        console.log('[Assistant] Setting participant attributes:', attrs);
        room.localParticipant.setAttributes(attrs);
      }
    };

    setAttrs();
    room.on('connected', setAttrs);
    return () => {
      room.off('connected', setAttrs);
    };
  }, [room, name, narrationStyle, language]);

  useEffect(() => {
    console.log('[Assistant] RoomView mounted, room state:', room.state);
    console.log('[Assistant] connection active:', connection.isConnectionActive);
  }, [room, connection.isConnectionActive]);

  useIOSAudioManagement(room, true);

  const {
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    cameraTrack: localCameraTrack,
    localParticipant,
  } = useLocalParticipant();
  const localParticipantIdentity = localParticipant.identity;

  const localScreenShareTrack = useParticipantTracks(
    [Track.Source.ScreenShare],
    localParticipantIdentity
  );

  const localVideoTrack =
    localCameraTrack && isCameraEnabled
      ? ({
          participant: localParticipant,
          publication: localCameraTrack,
          source: Track.Source.Camera,
        } satisfies TrackReference)
      : localScreenShareTrack.length > 0 && isScreenShareEnabled
      ? localScreenShareTrack[0]
      : null;

  // Camera facing mode
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const onFlipCamera = useCallback(async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    const videoTrack = localParticipant.getTrackPublication(Track.Source.Camera)?.track;
    if (videoTrack && videoTrack instanceof LocalVideoTrack) {
      await videoTrack.restartTrack({ facingMode: newMode });
    }
    setFacingMode(newMode);
  }, [facingMode, localParticipant]);

  // Messages
  const { messages, send } = useSessionMessages();
  const [isChatEnabled, setChatEnabled] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const onChatSend = useCallback(
    (message: string) => {
      send(message);
      setChatMessage('');
    },
    [setChatMessage, send]
  );

  // Control callbacks
  const micToggle = useTrackToggle({ source: Track.Source.Microphone });
  const cameraToggle = useTrackToggle({ source: Track.Source.Camera });
  const screenShareToggle = useTrackToggle({
    source: Track.Source.ScreenShare,
  });
  const onChatClick = useCallback(() => {
    setChatEnabled(!isChatEnabled);
  }, [isChatEnabled, setChatEnabled]);
  const onExitClick = useCallback(() => {
    connection.disconnect();
    router.back();
  }, [connection, router]);

  // Layout positioning
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get('window').width
  );
  const [containerHeight, setContainerHeight] = useState(
    Dimensions.get('window').height
  );

  const localVideoPosition = useLocalVideoPosition(isChatEnabled, {
    width: containerWidth,
    height: containerHeight,
  });

  let localVideoView = localVideoTrack ? (
    <Animated.View
      style={[
        {
          position: 'absolute',
          zIndex: 2,
          ...localVideoPosition,
        },
      ]}
    >
      <VideoTrack trackRef={localVideoTrack} mirror={facingMode === 'user'} style={styles.video} />
    </Animated.View>
  ) : null;

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerWidth(width);
        setContainerHeight(height);
      }}
    >
      {/* Main content area */}
      {!isChatEnabled ? (
        // Full-screen mode: model centered
        <View style={styles.mainContent}>
          <AgentVisualization
            style={styles.agentVisualization}
            modelAsset={modelAsset}
            accentColor={accentColor}
            isConnected={isConnected}
          />
        </View>
      ) : (
        // Chat mode: compact model at top, chat below
        <>
          <View style={styles.compactModelRow}>
            <AgentVisualization
              style={styles.agentVisualizationCompact}
              modelAsset={modelAsset}
              accentColor={accentColor}
              isConnected={isConnected}
            />
          </View>
          <ChatLog style={styles.logContainer} messages={messages} />
          <ChatBar
            style={styles.chatBar}
            value={chatMessage}
            onChangeText={(value) => {
              setChatMessage(value);
            }}
            onChatSend={onChatSend}
          />
        </>
      )}

      {localVideoView}

      <ControlBar
        style={styles.controlBar}
        options={{
          isMicEnabled: isMicrophoneEnabled,
          isCameraEnabled,
          isScreenShareEnabled,
          isChatEnabled,
          onMicClick: micToggle.toggle,
          onCameraClick: cameraToggle.toggle,
          onFlipCameraClick: onFlipCamera,
          onChatClick,
          onScreenShareClick: screenShareToggle.toggle,
          onExitClick,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentVisualization: {
    width: '100%',
    alignItems: 'center',
  },
  compactModelRow: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  agentVisualizationCompact: {
    width: '100%',
    alignItems: 'center',
    transform: [{ scale: 0.5 }],
  },
  logContainer: {
    width: '100%',
    flexGrow: 1,
    flexDirection: 'column',
    marginBottom: 8,
  },
  chatBar: {
    left: 0,
    right: 0,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  controlBar: {
    left: 0,
    right: 0,
    zIndex: 2,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

const expandedLocalWidth = 0.3;
const expandedLocalHeight = 0.2;
const collapsedWidth = 0.3;
const collapsedHeight = 0.2;

const createAnimConfig = (toValue: any) => {
  return {
    toValue,
    stiffness: 200,
    damping: 30,
    useNativeDriver: false,
    isInteraction: false,
    overshootClamping: true,
  };
};

const useLocalVideoPosition = (
  isChatVisible: boolean,
  containerDimens: { width: number; height: number }
): ViewStyle => {
  const width = useAnimatedValue(
    isChatVisible ? collapsedWidth : expandedLocalWidth
  );
  const height = useAnimatedValue(
    isChatVisible ? collapsedHeight : expandedLocalHeight
  );

  useEffect(() => {
    const widthAnim = Animated.spring(
      width,
      createAnimConfig(isChatVisible ? collapsedWidth : expandedLocalWidth)
    );
    const heightAnim = Animated.spring(
      height,
      createAnimConfig(isChatVisible ? collapsedHeight : expandedLocalHeight)
    );

    widthAnim.start();
    heightAnim.start();

    return () => {
      widthAnim.stop();
      heightAnim.stop();
    };
  }, [width, height, isChatVisible]);

  const x = useAnimatedValue(0);
  const y = useAnimatedValue(0);
  useEffect(() => {
    let targetX: number;
    let targetY: number;

    if (!isChatVisible) {
      targetX = 1 - expandedLocalWidth - 16 / containerDimens.width;
      targetY = 1 - expandedLocalHeight - 106 / containerDimens.height;
    } else {
      targetX = 1 - collapsedWidth - 16 / containerDimens.width;
      targetY = 16 / containerDimens.height;
    }

    const xAnim = Animated.spring(x, createAnimConfig(targetX));
    const yAnim = Animated.spring(y, createAnimConfig(targetY));
    xAnim.start();
    yAnim.start();
    return () => {
      xAnim.stop();
      yAnim.stop();
    };
  }, [containerDimens.width, containerDimens.height, x, y, isChatVisible]);

  return {
    left: x.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    top: y.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    width: width.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    height: height.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    marginTop: 16,
  };
};
