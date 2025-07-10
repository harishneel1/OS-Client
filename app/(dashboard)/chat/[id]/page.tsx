import { ChatInterface } from "@/components/chat/ChatInterface";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = params;

  return <ChatInterface chatId={id} />;
}
