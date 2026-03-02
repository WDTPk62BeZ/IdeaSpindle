import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function CircleTimer({ value, max, size = 56, colorOverride }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, (value / max) * circ);
  const autoColor = value <= 3 ? '#ff6b6b' : value <= max * 0.4 ? '#ffd32a' : '#63dcbe';
  const color = colorOverride || autoColor;
  return (
    <View style={{ width: size, height: size, flexShrink: 0 }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={`${progress} ${circ}`} strokeLinecap="round" />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color, fontSize: Math.floor(size * 0.27), fontWeight: '700' }}>{value}</Text>
      </View>
    </View>
  );
}
