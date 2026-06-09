import { Stack } from "expo-router";
import { T } from "@/lib/theme";

export default function PortalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.bgRoot } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="run-record" />
      <Stack.Screen name="run-detail" />
    </Stack>
  );
}
