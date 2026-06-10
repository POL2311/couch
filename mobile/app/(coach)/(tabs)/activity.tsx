import { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Scale, UserPlus } from "lucide-react-native";
import { getStudents, buildFeedItems, type Student, type FeedItem } from "@/lib/data";
import { Screen, PageHeader } from "@/components/ui";
import { T } from "@/lib/theme";

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudents().then(setStudents).finally(() => setLoading(false));
  }, []);

  const feed = useMemo(() => buildFeedItems(students), [students]);

  return (
    <Screen>
      <PageHeader title="Actividad" hint="Eventos recientes de tus alumnos" />
      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={T.textPrimary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 10 }}>
          {feed.map((item) => <FeedRow key={item.key} item={item} />)}
        </ScrollView>
      )}
    </Screen>
  );
}

function FeedRow({ item }: { item: FeedItem }) {
  const isWeigh = item.type === "weigh";
  const Icon = isWeigh ? Scale : UserPlus;
  const accent = isWeigh ? T.info : T.success;
  return (
    <View className="flex-row items-start p-4 rounded-2xl bg-surface border border-hairline">
      <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: accent + "1a" }}>
        <Icon size={16} color={accent} strokeWidth={1.75} />
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-primary text-[13px] font-medium">{item.title}</Text>
          <Text className="text-tertiary text-[11px]">{item.date.slice(5)}</Text>
        </View>
        <Text className="text-secondary text-[13px] mt-1">{item.desc}</Text>
        {isWeigh && item.delta !== undefined && item.delta !== 0 && (
          <Text className="text-[12px] mt-1" style={{ color: item.delta < 0 ? T.success : T.warning }}>
            {item.delta > 0 ? "+" : ""}{item.delta} kg vs anterior
          </Text>
        )}
      </View>
    </View>
  );
}
