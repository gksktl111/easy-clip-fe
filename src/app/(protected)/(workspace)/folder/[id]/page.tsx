import { FolderClipsRoute } from "@/app/(protected)/(workspace)/_routes/FolderClipsRoute";

interface FolderPageProps {
  params: Promise<{ id: string }>;
}

export default async function Folder({ params }: FolderPageProps) {
  const { id: folderId } = await params;

  return <FolderClipsRoute folderId={folderId} />;
}
