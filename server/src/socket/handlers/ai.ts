import { Server, Socket } from 'socket.io';
import { getAIAssistantResponse } from '../../services/aiService.js';
import { createMessage } from '../../services/messageService.js';
import { recordActivity } from '../../services/activityService.js';

interface AISocket extends Socket {
  userId?: string;
  userName?: string;
}

export function setupAIHandlers(io: Server, socket: AISocket): void {
  socket.on('chat:send_message', async (data: { room_id: string; content: string }) => {
    const { room_id, content } = data;

    if (!room_id || !content?.trim()) return;
    if (!socket.userId) return;

    const trimmedContent = content.trim();

    const userMessage = createMessage(room_id, socket.userId, trimmedContent, 'text');
    recordActivity(room_id, socket.userId, 'message_sent', {
      message_id: userMessage.id,
      preview: trimmedContent.substring(0, 100),
    });
    io.to(`room:${room_id}`).emit('chat:new_message', userMessage);

    const mayaMatch = trimmedContent.match(/@Maya\s*(.*)/i);
    if (mayaMatch) {
      const aiQuery = mayaMatch[1]?.trim() || 'Say hi and ask if they need help';

      try {
        const aiResponse = await getAIAssistantResponse(
          room_id,
          aiQuery,
          socket.userName || 'Someone',
          socket.userId
        );

        const aiMessage = createMessage(room_id, 'ai-maya', aiResponse, 'text');
        io.to(`room:${room_id}`).emit('chat:new_message', aiMessage);
      } catch (err) {
        console.error('AI error:', err);
      }
    }
  });
}
