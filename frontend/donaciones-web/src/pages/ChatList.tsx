import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarLogged from "../components/NavbarLogged";
import { useAuth } from "../context/AuthContext";
import { realtimeDb } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";

const USERS_API = "http://localhost:4000/api/users";

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const chatsRef = ref(realtimeDb, "chats");

    const unsubscribe = onValue(chatsRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setChats([]);
        setLoading(false);
        return;
      }

      const list: any[] = [];

      for (const chatId of Object.keys(data)) {
        const [u1, u2] = chatId.split("_");

        if (u1 === user.uid || u2 === user.uid) {
          const otherId = u1 === user.uid ? u2 : u1;

          // Traer nombre real
          const res = await axios.get(`${USERS_API}/${otherId}`);

          list.push({
            chatId,
            otherUserId: otherId,
            otherName: res.data.name,
          });
        }
      }

      setChats(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f5efe7]">
      <NavbarLogged />

      <div className="pt-24 px-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mis Chats</h1>

        {loading ? (
          <p>Cargando chats...</p>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            <p>No tienes chats todavía.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.chatId}
                className="p-4 bg-white border rounded-xl shadow cursor-pointer hover:bg-[#fff3e8]"
                onClick={() =>
                  navigate(`/chat/${chat.chatId}?name=${chat.otherName}`)
                }
              >
                <p className="text-lg font-semibold">{chat.otherName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
