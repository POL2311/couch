/* ═══════════════════════════════════════════
   Gráficas reutilizables (SF Dark Pro).
   ═══════════════════════════════════════════ */
import { View, Text } from "react-native";
import Svg, { Polyline, Rect } from "react-native-svg";
import { T } from "@/lib/theme";

export function Sparkline({ data, color = T.success, height = 70, suffix = "" }: { data: number[]; color?: string; height?: number; suffix?: string }) {
  if (!data || data.length < 2) return <Text className="text-tertiary text-[12px]">Sin datos suficientes</Text>;
  const W = 320;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${height - ((v - min) / range) * (height - 14) - 7}`).join(" ");
  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        <Polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <View className="flex-row justify-between mt-1.5">
        <Text className="text-tertiary text-[11px]">{data[0]}{suffix}</Text>
        <Text className="text-primary text-[11px] font-medium">{data[data.length - 1]}{suffix}</Text>
      </View>
    </View>
  );
}

export function Bars({ data, color = T.info, height = 80 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  if (!data.length) return <Text className="text-tertiary text-[12px]">Sin datos</Text>;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const W = 320;
  const gap = 6;
  const bw = (W - gap * (data.length - 1)) / data.length;
  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const h = Math.max((d.value / max) * (height - 6), 2);
          return <Rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} rx={3} fill={color} opacity={0.85} />;
        })}
      </Svg>
      <View className="flex-row justify-between mt-1.5">
        {data.map((d, i) => <Text key={i} className="text-tertiary text-[9px]" style={{ width: bw, textAlign: "center" }}>{d.label}</Text>)}
      </View>
    </View>
  );
}
