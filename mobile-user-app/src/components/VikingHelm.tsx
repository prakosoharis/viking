import React from 'react';
import { Svg, Path, Rect, Circle, Ellipse } from 'react-native-svg';

interface VikingHelmProps {
  size?: number;
  color?: string;
}

export const VikingHelm: React.FC<VikingHelmProps> = ({
  size = 64,
  color = '#2563EB'
}) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Left Horn */}
    <Path
      d="M15 35 Q10 25 8 15 Q7 10 10 8 Q12 7 14 10 L20 30 Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
    />

    {/* Right Horn */}
    <Path
      d="M85 35 Q90 25 92 15 Q93 10 90 8 Q88 7 86 10 L80 30 Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
    />

    {/* Helm Main Body */}
    <Ellipse cx="50" cy="55" rx="32" ry="35" fill={color} />

    {/* Face Opening */}
    <Rect x="35" y="50" width="30" height="25" rx="3" fill="#FFFFFF" opacity={0.9} />

    {/* Eye Slits */}
    <Rect x="38" y="56" width="10" height="4" rx="1} fill={color} />
    <Rect x="52" y="56" width="10" height="4" rx="1} fill={color} />

    {/* Nose Guard */}
    <Path
      d="M48 60 L50 70 L52 60 Z"
      fill={color}
      opacity={0.8}
    />

    {/* Helm Details - Rivets */}
    <Circle cx="25" cy="50" r={2} fill="#FFFFFF" opacity={0.6} />
    <Circle cx="75" cy="50" r={2} fill="#FFFFFF" opacity={0.6} />
    <Circle cx="30" cy="65" r={2} fill="#FFFFFF" opacity={0.6} />
    <Circle cx="70" cy="65" r={2} fill="#FFFFFF" opacity={0.6} />

    {/* Top Ridge */}
    <Path
      d="M30 38 Q50 35 70 38"
      stroke="#FFFFFF"
      strokeWidth="2}
      fill="none"
      opacity={0.5}
    />
  </Svg>
);
