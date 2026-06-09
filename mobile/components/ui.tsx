/* ═══════════════════════════════════════════
   Componentes UI compartidos — estética SF Dark Pro
   ═══════════════════════════════════════════ */
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T, avatarBg } from "@/lib/theme";

/** Contenedor de pantalla con fondo negro y safe-area superior. */
export function Screen({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-root" style={{ paddingTop: insets.top }}>
      {children}
    </View>
  );
}

/** Cabecera de página (título + subtítulo + acción opcional). */
export function PageHeader({ title, hint, right }: { title: string; hint?: string; right?: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4 border-b border-hairline">
      <View className="flex-1 pr-3">
        <Text className="text-primary text-[22px] font-semibold">{title}</Text>
        {hint && <Text className="text-tertiary text-[12px] mt-0.5">{hint}</Text>}
      </View>
      {right}
    </View>
  );
}

/** Tarjeta flotante (gris sutil sobre negro). */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <View className={`rounded-2xl bg-surface border border-hairline overflow-hidden ${className}`}>{children}</View>;
}

/** Encabezado interno de tarjeta. */
export function CardTitle({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View className="px-5 py-4 border-b border-hairline flex-row items-center justify-between">
      <Text className="text-primary text-[14px] font-medium">{title}</Text>
      {right}
    </View>
  );
}

/** Etiqueta de color (pill) con texto y color de acento. */
export function Pill({ text, color, bg }: { text: string; color: string; bg?: string }) {
  return (
    <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: bg ?? color + "1a" }}>
      <Text className="text-[10px] font-medium" style={{ color }}>{text}</Text>
    </View>
  );
}

/** Estado vacío. */
export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <Text className="text-tertiary text-[13px] text-center">{message}</Text>
      {hint && <Text className="text-tertiary/60 text-[11px] text-center mt-1.5" style={{ color: T.textTertiary }}>{hint}</Text>}
    </View>
  );
}

/** Avatar circular con iniciales. */
export function Avatar({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  return (
    <View className="rounded-full items-center justify-center" style={{ width: size, height: size, backgroundColor: avatarBg(color) }}>
      <Text className="text-white font-semibold" style={{ fontSize: size * 0.32 }}>{initials}</Text>
    </View>
  );
}
