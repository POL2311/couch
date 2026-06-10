/* ═══════════════════════════════════════════
   Ilustraciones planas de alimentos (estilo Fitia)
   Portadas 1:1 de la web (src/app/portal/page.tsx)
   a react-native-svg. Cada una es un SVG 40×40
   renderizado a 28×28 dentro de un tile con tinte.
   ═══════════════════════════════════════════ */
import { View } from "react-native";
import Svg, { Ellipse, Rect, Circle, Path } from "react-native-svg";

const SIZE = 28;
const box = { width: SIZE, height: SIZE, viewBox: "0 0 40 40" } as const;

function IlluChicken() {
  return (
    <Svg {...box}>
      <Ellipse cx={20} cy={23} rx={10} ry={8} fill="#F5A623" />
      <Ellipse cx={20} cy={22} rx={9} ry={7} fill="#F7BC52" />
      <Ellipse cx={17} cy={19} rx={4} ry={2.5} fill="#FBCF72" opacity={0.7} />
      <Rect x={18.5} y={28} width={3} height={7} rx={1.5} fill="#F0E6D3" />
      <Ellipse cx={20} cy={35.5} rx={2.5} ry={1.5} fill="#E8D5BA" />
      <Ellipse cx={20} cy={31} rx={6} ry={1.5} fill="#000" opacity={0.08} />
    </Svg>
  );
}

function IlluBeef() {
  return (
    <Svg {...box}>
      <Ellipse cx={20} cy={22} rx={13} ry={9} fill="#C0392B" />
      <Ellipse cx={20} cy={21} rx={12} ry={8} fill="#E74C3C" />
      <Ellipse cx={14} cy={20} rx={2.5} ry={1.2} fill="#F5CBA7" opacity={0.9} />
      <Ellipse cx={22} cy={18} rx={3} ry={1} fill="#F5CBA7" opacity={0.8} />
      <Ellipse cx={26} cy={23} rx={2} ry={1} fill="#F5CBA7" opacity={0.7} />
      <Path d="M12 17 Q16 15 20 17" stroke="#A93226" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <Path d="M18 19 Q22 17 26 19" stroke="#A93226" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <Ellipse cx={15} cy={17} rx={3} ry={1.5} fill="#fff" opacity={0.1} />
    </Svg>
  );
}

function IlluEgg() {
  return (
    <Svg {...box}>
      <Ellipse cx={20} cy={23} rx={13} ry={9} fill="#F5F0E8" />
      <Ellipse cx={15} cy={19} rx={5} ry={3} fill="#fff" opacity={0.55} />
      <Circle cx={20} cy={22} r={6} fill="#F39C12" />
      <Circle cx={20} cy={21.5} r={5.5} fill="#F5B041" />
      <Ellipse cx={18} cy={19.5} rx={2} ry={1.3} fill="#FDEBD0" opacity={0.7} />
    </Svg>
  );
}

function IlluBread() {
  return (
    <Svg {...box}>
      <Rect x={8} y={22} width={24} height={10} rx={3} fill="#C8832A" />
      <Ellipse cx={20} cy={22} rx={12} ry={7} fill="#D4934A" />
      <Ellipse cx={20} cy={21} rx={11} ry={6} fill="#E8A857" />
      <Path d="M14 17 L14 24" stroke="#B8712A" strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M20 15 L20 24" stroke="#B8712A" strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M26 17 L26 24" stroke="#B8712A" strokeWidth={1.2} strokeLinecap="round" />
      <Ellipse cx={17} cy={18} rx={4} ry={2} fill="#F4C878" opacity={0.5} />
    </Svg>
  );
}

function IlluMilk() {
  return (
    <Svg {...box}>
      <Path d="M13 14 L15 34 H25 L27 14 Z" fill="#E8F4FD" />
      <Path d="M13 14 L15 34 H25 L27 14 Z" fill="#BFD9F0" opacity={0.4} />
      <Path d="M14.5 20 L16 34 H24 L25.5 20 Z" fill="#fff" />
      <Rect x={11} y={12} width={18} height={4} rx={2} fill="#A8C8E8" />
      <Rect x={11} y={12} width={18} height={2} rx={1} fill="#C8DFF0" />
      <Rect x={15} y={22} width={2.5} height={8} rx={1.2} fill="#fff" opacity={0.7} />
    </Svg>
  );
}

function IlluPotato() {
  return (
    <Svg {...box}>
      <Ellipse cx={20} cy={22} rx={13} ry={9} fill="#C9A96E" />
      <Ellipse cx={20} cy={21} rx={12} ry={8} fill="#D4B97E" />
      <Circle cx={14} cy={20} r={1.2} fill="#A8823E" />
      <Circle cx={25} cy={19} r={0.9} fill="#A8823E" />
      <Circle cx={21} cy={25} r={1} fill="#A8823E" />
      <Ellipse cx={16} cy={17} rx={4} ry={2.5} fill="#F0D9A8" opacity={0.5} />
    </Svg>
  );
}

function IlluRice() {
  const grains = [14, 17, 20, 23, 26, 15, 19, 23, 17, 21];
  return (
    <Svg {...box}>
      <Path d="M8 24 Q8 34 20 34 Q32 34 32 24 Z" fill="#D4A853" />
      <Ellipse cx={20} cy={24} rx={12} ry={4} fill="#E8B96A" />
      <Ellipse cx={20} cy={21} rx={11} ry={7} fill="#F8F4EC" />
      {grains.map((x, i) => {
        const cy = 18 + (i % 3) * 2;
        return <Ellipse key={i} cx={x} cy={cy} rx={1.5} ry={0.7} fill="#EDE8DC" rotation={i * 18} originX={x} originY={cy} />;
      })}
      <Path d="M16 13 Q17 10 16 8" stroke="#ddd" strokeWidth={1} strokeLinecap="round" opacity={0.4} />
      <Path d="M20 12 Q21 9 20 7" stroke="#ddd" strokeWidth={1} strokeLinecap="round" opacity={0.4} />
      <Path d="M24 13 Q25 10 24 8" stroke="#ddd" strokeWidth={1} strokeLinecap="round" opacity={0.4} />
    </Svg>
  );
}

function IlluFish() {
  return (
    <Svg {...box}>
      <Ellipse cx={19} cy={22} rx={12} ry={7} fill="#5BA4CF" />
      <Ellipse cx={19} cy={21.5} rx={11} ry={6} fill="#74B9E3" />
      <Path d="M30 22 L37 17 L37 27 Z" fill="#4A90C4" />
      <Circle cx={11} cy={20} r={2} fill="#fff" />
      <Circle cx={11} cy={20} r={1} fill="#1a1a2e" />
      <Path d="M16 18 Q18 16 20 18" stroke="#4A90C4" strokeWidth={0.8} fill="none" />
      <Path d="M20 18 Q22 16 24 18" stroke="#4A90C4" strokeWidth={0.8} fill="none" />
      <Path d="M18 22 Q20 20 22 22" stroke="#4A90C4" strokeWidth={0.8} fill="none" />
      <Path d="M16 17 Q20 12 24 17" fill="#5BA4CF" stroke="#4A90C4" strokeWidth={0.5} />
    </Svg>
  );
}

function IlluOats() {
  return (
    <Svg {...box}>
      <Path d="M9 25 Q9 35 20 35 Q31 35 31 25 Z" fill="#C8934A" />
      <Ellipse cx={20} cy={25} rx={11} ry={3.5} fill="#D4A45C" />
      <Ellipse cx={20} cy={22} rx={10} ry={6.5} fill="#E8C98A" />
      <Ellipse cx={15} cy={20} rx={2} ry={1} fill="#D4B06A" rotation={-20} originX={15} originY={20} />
      <Ellipse cx={20} cy={19} rx={2} ry={1} fill="#D4B06A" rotation={10} originX={20} originY={19} />
      <Ellipse cx={25} cy={21} rx={2} ry={1} fill="#D4B06A" rotation={-15} originX={25} originY={21} />
      <Ellipse cx={17} cy={23} rx={2} ry={1} fill="#D4B06A" rotation={25} originX={17} originY={23} />
      <Ellipse cx={23} cy={24} rx={2} ry={1} fill="#D4B06A" rotation={-5} originX={23} originY={24} />
    </Svg>
  );
}

function IlluSweetPotato() {
  return (
    <Svg {...box}>
      <Ellipse cx={20} cy={23} rx={14} ry={9} fill="#E07B39" />
      <Ellipse cx={20} cy={22} rx={13} ry={8} fill="#F0904A" />
      <Path d="M10 22 Q15 19 20 22 Q25 25 30 22" stroke="#D06830" strokeWidth={1} fill="none" opacity={0.6} />
      <Path d="M11 26 Q16 23 21 26 Q26 29 31 26" stroke="#D06830" strokeWidth={0.8} fill="none" opacity={0.4} />
      <Ellipse cx={20} cy={15} rx={2} ry={3} fill="#5D8A3C" rotation={10} originX={20} originY={15} />
      <Ellipse cx={23} cy={14} rx={1.5} ry={2.5} fill="#6DA048" rotation={-10} originX={23} originY={14} />
      <Ellipse cx={15} cy={19} rx={4} ry={2.5} fill="#FBB06A" opacity={0.4} />
    </Svg>
  );
}

function IlluSalad() {
  return (
    <Svg {...box}>
      <Path d="M8 26 Q8 36 20 36 Q32 36 32 26 Z" fill="#C8834A" />
      <Ellipse cx={20} cy={26} rx={12} ry={3.5} fill="#D49060" />
      <Ellipse cx={14} cy={22} rx={5} ry={4} fill="#4CAF50" rotation={-15} originX={14} originY={22} />
      <Ellipse cx={22} cy={20} rx={6} ry={4} fill="#66BB6A" rotation={10} originX={22} originY={20} />
      <Ellipse cx={18} cy={23} rx={5} ry={3.5} fill="#388E3C" rotation={-5} originX={18} originY={23} />
      <Circle cx={26} cy={23} r={3.5} fill="#E53935" />
      <Ellipse cx={26} cy={21} rx={1.5} ry={0.8} fill="#EF5350" opacity={0.7} />
      <Rect x={13} y={20} width={4} height={3} rx={0.5} fill="#FDD835" rotation={-10} originX={13} originY={20} />
    </Svg>
  );
}

function IlluTuna() {
  return (
    <Svg {...box}>
      <Ellipse cx={20} cy={27} rx={13} ry={5} fill="#A8B8C8" />
      <Rect x={7} y={18} width={26} height={9} fill="#B8C8D8" />
      <Ellipse cx={20} cy={18} rx={13} ry={5} fill="#C8D8E8" />
      <Ellipse cx={20} cy={18} rx={12} ry={4} fill="#D4DFE8" />
      <Ellipse cx={20} cy={18} rx={10} ry={3} fill="#E2EBF0" />
      <Ellipse cx={20} cy={18} rx={8} ry={2.5} fill="#F4A261" />
      <Path d="M13 17 Q16 15 20 17 Q24 15 27 17" stroke="#E08042" strokeWidth={0.8} fill="none" />
      <Path d="M20 14 L24 11 L26 13 L22 16" fill="#9AAFC0" stroke="#888" strokeWidth={0.5} />
    </Svg>
  );
}

function IlluBanana() {
  return (
    <Svg {...box}>
      <Path d="M10 28 Q10 12 22 10 Q30 9 32 14 Q34 19 28 24 Q22 29 10 28 Z" fill="#FBBF24" />
      <Path d="M11 27 Q11 14 22 12 Q29 11 31 15 Q33 20 27 24 Q22 28 11 27 Z" fill="#FCD34D" />
      <Path d="M10 28 Q8 30 9 32 Q10 33 12 31 Q11 29 10 28 Z" fill="#D97706" />
      <Path d="M32 14 Q35 12 36 13 Q37 15 34 16 Q33 15 32 14 Z" fill="#D97706" />
      <Path d="M14 14 Q18 12 22 13" stroke="#FEF3C7" strokeWidth={1.5} strokeLinecap="round" opacity={0.8} fill="none" />
    </Svg>
  );
}

function IlluTortilla() {
  return (
    <Svg {...box}>
      <Ellipse cx={20} cy={28} rx={13} ry={4} fill="#C8934A" />
      <Ellipse cx={20} cy={25} rx={13} ry={4} fill="#D4A45C" />
      <Ellipse cx={20} cy={22} rx={13} ry={4} fill="#E8B96A" />
      <Ellipse cx={20} cy={22} rx={12} ry={3.5} fill="#F0C878" />
      <Ellipse cx={20} cy={22} rx={10} ry={2.5} fill="#F4D28A" opacity={0.7} />
      <Circle cx={15} cy={21} r={1} fill="#C8834A" opacity={0.5} />
      <Circle cx={24} cy={22} r={0.8} fill="#C8834A" opacity={0.5} />
      <Circle cx={20} cy={20} r={1.2} fill="#C8834A" opacity={0.4} />
    </Svg>
  );
}

const ILLU_MAP: Record<string, React.FC> = {
  chicken: IlluChicken,
  beef: IlluBeef,
  egg: IlluEgg,
  bread: IlluBread,
  wheat: IlluBread,
  milk: IlluMilk,
  potato: IlluPotato,
  apple: IlluSweetPotato,
  rice: IlluRice,
  fish: IlluFish,
  oats: IlluOats,
  "sweet-potato": IlluSweetPotato,
  salad: IlluSalad,
  tuna: IlluTuna,
  banana: IlluBanana,
  tortilla: IlluTortilla,
  default: IlluEgg,
};

const ILLU_BG: Record<string, string> = {
  chicken: "rgba(245,166,35,0.1)",
  beef: "rgba(192,57,43,0.1)",
  egg: "rgba(243,156,18,0.1)",
  bread: "rgba(212,147,90,0.1)",
  wheat: "rgba(212,147,90,0.1)",
  milk: "rgba(100,180,230,0.1)",
  potato: "rgba(201,169,110,0.1)",
  apple: "rgba(224,123,57,0.1)",
  rice: "rgba(248,244,236,0.07)",
  fish: "rgba(91,164,207,0.1)",
  oats: "rgba(232,201,138,0.1)",
  "sweet-potato": "rgba(224,123,57,0.12)",
  salad: "rgba(76,175,80,0.1)",
  tuna: "rgba(244,162,97,0.1)",
  banana: "rgba(251,191,36,0.1)",
  tortilla: "rgba(240,200,120,0.1)",
  default: "rgba(255,255,255,0.05)",
};

export function FoodIllu({ iconKey, size = 48 }: { iconKey?: string; size?: number }) {
  const key = iconKey ?? "default";
  const Comp = ILLU_MAP[key] ?? ILLU_MAP.default;
  const bg = ILLU_BG[key] ?? ILLU_BG.default;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Comp />
    </View>
  );
}
