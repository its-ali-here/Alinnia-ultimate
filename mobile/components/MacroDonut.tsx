import Svg, { Circle } from "react-native-svg";

interface Segment {
  value: number;
  color: string;
}

interface MacroDonutProps {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
}

export function MacroDonut({ segments, size = 44, strokeWidth = 8 }: MacroDonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let cumulative = 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((segment, i) => {
        const fraction = segment.value / total;
        const dash = fraction * circumference;
        const rotation = (cumulative / total) * 360 - 90;
        cumulative += segment.value;
        return (
          <Circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="butt"
            fill="none"
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          />
        );
      })}
    </Svg>
  );
}
