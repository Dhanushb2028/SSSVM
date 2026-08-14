import { HomeworkDetailContent } from "@/components/shared/homework-detail-content";

export default async function TeacherHomeworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HomeworkDetailContent id={id} />;
}
