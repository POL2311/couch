import { Tabs } from "expo-router";
import { UserCog, User } from "lucide-react-native";
import { T } from "@/lib/theme";

export default function AdminTabsLayout() {
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
      <Tabs.Screen name="index" options={{ title: "Coaches", tabBarIcon: ({ color, size }) => <UserCog color={color} size={size - 2} strokeWidth={1.75} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} strokeWidth={1.75} /> }} />
    </Tabs>
  );
}
