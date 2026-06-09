import { Tabs } from "expo-router";
import { LayoutGrid, Users, ClipboardList, CreditCard, Activity } from "lucide-react-native";
import { T } from "@/lib/theme";

export default function CoachTabsLayout() {
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
      <Tabs.Screen name="index" options={{ title: "Resumen", tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size - 2} strokeWidth={1.75} /> }} />
      <Tabs.Screen name="students" options={{ title: "Alumnos", tabBarIcon: ({ color, size }) => <Users color={color} size={size - 2} strokeWidth={1.75} /> }} />
      <Tabs.Screen name="templates" options={{ title: "Plantillas", tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size - 2} strokeWidth={1.75} /> }} />
      <Tabs.Screen name="payments" options={{ title: "Pagos", tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size - 2} strokeWidth={1.75} /> }} />
      <Tabs.Screen name="activity" options={{ title: "Actividad", tabBarIcon: ({ color, size }) => <Activity color={color} size={size - 2} strokeWidth={1.75} /> }} />
    </Tabs>
  );
}
