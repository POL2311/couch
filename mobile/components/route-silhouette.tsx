/* ═══════════════════════════════════════════
   Silueta del recorrido (estilo Strava, SIN mapa).
   Toma los puntos GPS y traza la línea con SVG.
   No usa Google Maps ni llave de API.
   ═══════════════════════════════════════════ */
import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import type { GpsPoint } from "@/lib/data";
import { projectTrack } from "@/lib/geo";
import { T } from "@/lib/theme";

export function RouteSilhouette({
  track,
  width = 300,
  height = 200,
  color = "#fff",
  strokeWidth = 3,
  showEndpoints = true,
}: {
  track: GpsPoint[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showEndpoints?: boolean;
}) {
  const pts = projectTrack(track, width, height);

  if (pts.length < 2) {
    return <View style={{ width, height }} />;
  }

  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const start = pts[0];
  const end = pts[pts.length - 1];

  return (
    <Svg width={width} height={height}>
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndpoints && (
        <>
          <Circle cx={start.x} cy={start.y} r={strokeWidth + 2} fill={T.success} stroke="#000" strokeWidth={1.5} />
          <Circle cx={end.x} cy={end.y} r={strokeWidth + 2} fill={T.danger} stroke="#000" strokeWidth={1.5} />
        </>
      )}
    </Svg>
  );
}
