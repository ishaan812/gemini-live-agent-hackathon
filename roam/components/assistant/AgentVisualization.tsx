import { useAgent } from '@livekit/components-react';
import { BarVisualizer, VideoTrack } from '@livekit/react-native';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Fonts } from '../../constants/colors';
import ModelViewer from '../ModelViewer';

type AgentVisualizationProps = {
  style: StyleProp<ViewStyle>;
  modelAsset: number;
  accentColor: string;
  isConnected: boolean;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODEL_WIDTH = SCREEN_WIDTH * 0.75;
const MODEL_HEIGHT = MODEL_WIDTH * 1.45;

export default function AgentVisualization({
  style,
  modelAsset,
  accentColor,
  isConnected,
}: AgentVisualizationProps) {
  const { state, microphoneTrack, cameraTrack } = useAgent();
  const [barWidth, setBarWidth] = useState(0);
  const [barBorderRadius, setBarBorderRadius] = useState(0);

  const layoutCallback = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    const size = 0.35 * height;
    setBarWidth(size);
    setBarBorderRadius(size);
  }, []);

  let videoView = cameraTrack ? (
    <VideoTrack trackRef={cameraTrack} style={styles.videoTrack} />
  ) : null;

  return (
    <View style={[style, styles.container]}>
      {/* Voice bars above the model */}
      <View style={styles.barVisualizerContainer} onLayout={layoutCallback}>
        <BarVisualizer
          state={state}
          barCount={5}
          options={{
            minHeight: 0.2,
            barWidth: barWidth,
            barColor: accentColor,
            barBorderRadius: barBorderRadius,
          }}
          trackRef={microphoneTrack}
          style={styles.barVisualizer}
        />
      </View>

      {/* 3D Model */}
      <View style={styles.modelContainer}>
        <ModelViewer
          modelAsset={modelAsset}
          accentColor={accentColor}
          width={MODEL_WIDTH}
          height={MODEL_HEIGHT}
          fitScale={2.2}
          yOffset={0}
        />
        {videoView}
      </View>

      {/* Connection status pill */}
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: isConnected
              ? 'rgba(74, 222, 128, 0.12)'
              : 'rgba(248, 113, 113, 0.12)',
            borderColor: isConnected
              ? 'rgba(74, 222, 128, 0.30)'
              : 'rgba(248, 113, 113, 0.30)',
          },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isConnected ? '#4ADE80' : '#F87171' },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: isConnected ? '#4ADE80' : '#F87171' },
          ]}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    borderRadius: 20,
  },
  barVisualizerContainer: {
    width: '60%',
    height: 48,
    marginBottom: 8,
  },
  barVisualizer: {
    width: '100%',
    height: '100%',
  },
  modelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
});
