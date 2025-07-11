import { ChatInterface } from "@/components/chat/ChatInterface";

interface ProjectChatPageProps {
  params: {
    projectId: string;
    chatId: string;
  };
}

export default async function ProjectChatPage({
  params,
}: ProjectChatPageProps) {
  const { projectId, chatId } = await params;

  return <ChatInterface chatId={chatId} projectId={projectId} />;
}
