import { Tabs } from "expo-router";
import { Flame, TrendingUp, User, Footprints, Users } from "lucide-react-native";
import { T } from "@/lib/theme";

export default function PortalTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: T.textPrimary,
        tabBarInactiveTintColor: T.textTertiary,
        sceneStyle: { backgroundColor: T.bgRoot },
        tabBarStyle: { backgroundColor: "#08080a", borderTopColor: T.hairline, borderTopWidth: 1, height: 88, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "500" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Hoy", tabBarIcon: ({ color, size }) => <Flame color={color} size={size - 2} strokeWidth={1.75} /> }} />
      <Tabs.Screen name="run" options={{ title: "Correr", tabBarIcon: ({ color, size }) => <Footprints color={color} size={size - 2} strokeWidth={1.75} /> }} />
      <Tabs.Screen name="progress" options={{ title: "Progreso", tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size - 2} strokeWidth={1.75} /> }} />
      <Tabs.Screen name="salas" options={{ title: "Salas", tabBarIcon: ({ color, size }) => <Users color={color} size={size - 2} strokeWidth={1.75} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} strokeWidth={1.75} /> }} />
    </Tabs>
  );
}
