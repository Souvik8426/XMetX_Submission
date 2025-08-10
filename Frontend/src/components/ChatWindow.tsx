import { useState, useEffect, useRef } from "react";
import { User } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  or,
  and
} from "firebase/firestore";
import { db } from "@/components/firebase/firebase";
import { 
  MessageSquare, 
  X, 
  Send,
  Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  chatWithUserId: string;
  chatWithUserName: string;
  chatWithUserAvatar?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: any;
  senderName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  chatWithUserId, 
  chatWithUserName,
  chatWithUserAvatar 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    // Query messages between current user and the other user
    const messagesQuery = query(
      collection(db, 'messages'),
      or(
        and(
          where('senderId', '==', currentUser.uid),
          where('receiverId', '==', chatWithUserId)
        ),
        and(
          where('senderId', '==', chatWithUserId),
          where('receiverId', '==', currentUser.uid)
        )
      ),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [isOpen, currentUser, chatWithUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        receiverId: chatWithUserId,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        senderName: currentUser.displayName || 'Anonymous'
      });
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-[#5C92C7]/20 transition-all duration-300 ${
      isMinimized ? 'h-14 w-80' : 'h-96 w-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1F376A] to-[#5C92C7] text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-white/30">
            <AvatarImage src={chatWithUserAvatar} />
            <AvatarFallback className="bg-[#5C92C7] text-white text-sm">
              {chatWithUserName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{chatWithUserName}</h3>
            <p className="text-xs opacity-80">Online</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-64 bg-[#f9f7f2]">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                      message.senderId === currentUser?.uid
                        ? 'bg-[#5C92C7] text-white'
                        : 'bg-white border border-[#5C92C7]/20 text-[#333333]'
                    }`}
                  >
                    <p>{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === currentUser?.uid ? 'text-white/70' : 'text-[#3D6B9C]'
                    }`}>
                      {message.timestamp?.toDate?.()?.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-[#5C92C7]/20">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border-[#5C92C7]/30 focus:border-[#1F376A] text-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white h-9 w-9"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
