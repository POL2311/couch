import { useLocalSearchParams } from "expo-router";
import { StudentDetailView } from "@/components/student-detail-view";

export default function CoachStudentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StudentDetailView studentId={id} editable />;
}
