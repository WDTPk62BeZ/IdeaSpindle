import { View, Text, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const BASE_WIDTH = 390;
const MAX_SCALE = 2;

export default function CircleTimer({ value, max, size = 56, colorOverride }) {
  const { width, height } = useWindowDimensions();
  // 短辺を基準にすることで縦横どちらでも一定のスケールになる
  const shortSide = Math.min(width, height);
  const scale = Math.min(MAX_SCALE, shortSide / BASE_WIDTH);
  const s = Math.round(size * scale);

  const r = (s / 2) - 5;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, (value / max) * circ);
  const autoColor = value <= 3 ? '#ff6b6b' : value <= max * 0.4 ? '#ffd32a' : '#63dcbe';
  const color = colorOverride || autoColor;
  return (
    <View style={{ width: s, height: s, flexShrink: 0 }}>
      <Svg width={s} height={s} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={s / 2} cy={s / 2} r={r} fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
        <Circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={`${progress} ${circ}`} strokeLinecap="round" />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color, fontSize: Math.floor(s * 0.27), fontWeight: '700' }}>{value}</Text>
      </View>
    </View>
  );
}
