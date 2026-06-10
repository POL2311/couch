import { Stack } from "expo-router";
import { T } from "@/lib/theme";

export default function CoachLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.bgRoot } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="student/[id]" />
      <Stack.Screen name="exercises" />
      <Stack.Screen name="periodization" />
    </Stack>
  );
}
