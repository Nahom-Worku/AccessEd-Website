'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useChatStore } from '@/lib/stores/chat-store'
import { useChat } from '@/lib/hooks/use-chat'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { PageViewer } from '@/components/chat/page-viewer'

export default function ChatPage() {
  const { sidebarOpen, toggleSidebar, pageViewer, setPageViewer } = useChatStore()

  const {
    messages,
    input,
    setInput,
    isStreaming,
    streamingContent,
    selectedCourseId,
    setSelectedCourseId,
    handleSend,
    handleNewChat,
    loadSession,
    handleDeleteSession,
    handleRenameSession,
    openPageViewer,
  } = useChat()

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sessions Sidebar */}
      <ChatSidebar
        onSelectSession={loadSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />

      {/* Chat Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="border-b border-border px-4 py-2 flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
        </div>

        {/* Messages */}
        <ChatMessages
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onPromptClick={(prompt) => handleSend(prompt)}
          onCitationClick={(citations, docIdx, page) => openPageViewer(citations, docIdx, page)}
          onSourceClick={(citations, docIdx) => openPageViewer(citations, docIdx)}
        />

        {/* Input */}
        <ChatInput
          input={input}
          setInput={setInput}
          isStreaming={isStreaming}
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
          onSend={() => handleSend()}
        />
      </div>

      {/* Page Viewer */}
      <PageViewer
        data={pageViewer?.data ?? null}
        highlightPage={pageViewer?.highlightPage}
        onClose={() => setPageViewer(null)}
      />
    </div>
  )
}
