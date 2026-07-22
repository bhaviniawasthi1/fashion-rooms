import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ChatContextType {
  minimized: boolean;
  activeRoomId: string | null;
  activeRoomName: string | null;
  toggleMinimize: () => void;
  setActiveRoom: (id: string, name: string) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  minimized: false,
  activeRoomId: null,
  activeRoomName: null,
  toggleMinimize: () => {},
  setActiveRoom: () => {},
  clearChat: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [minimized, setMinimized] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);

  const toggleMinimize = useCallback(() => {
    setMinimized((prev) => !prev);
  }, []);

  const setActiveRoom = useCallback((id: string, name: string) => {
    setActiveRoomId(id);
    setActiveRoomName(name);
  }, []);

  const clearChat = useCallback(() => {
    setMinimized(false);
    setActiveRoomId(null);
    setActiveRoomName(null);
  }, []);

  return (
    <ChatContext.Provider value={{ minimized, activeRoomId, activeRoomName, toggleMinimize, setActiveRoom, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
