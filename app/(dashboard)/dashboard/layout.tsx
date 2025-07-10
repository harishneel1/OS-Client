import { Sidebar } from "../../../components/layout/Sidebar";
import { ChatProvider } from "../../../components/context/ChatContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </ChatProvider>
  );
}
