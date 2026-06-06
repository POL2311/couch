import StudentDetailClient from "@/components/student-detail";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StudentDetailClient studentId={id} />;
}
