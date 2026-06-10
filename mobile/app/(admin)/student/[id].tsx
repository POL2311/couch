import { useLocalSearchParams } from "expo-router";
import { StudentDetailView } from "@/components/student-detail-view";

export default function AdminStudentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StudentDetailView studentId={id} />;
}
