import { Message } from "./ChatInterface";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? "text-blue-200" : "text-gray-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
