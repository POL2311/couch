import { Stack } from "expo-router";
import { T } from "@/lib/theme";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.bgRoot } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="coach/[id]" />
      <Stack.Screen name="student/[id]" />
    </Stack>
  );
}
