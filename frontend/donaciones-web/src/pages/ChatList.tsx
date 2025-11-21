import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarLogged from "../components/NavbarLogged";
import { useAuth } from "../context/AuthContext";
import { firestoreDb } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const USERS_API = "http://localhost:4000/api/users";
const DONATION_API = "http://localhost:4000/api/donations";

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(collection(firestoreDb, "chats"), async (snapshot) => {
      const list: any[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const chatDocId = docSnap.id;
        const chatId = data.chatId;

        if (!chatId) continue;

        // parsear chatId
        const [donationId, requesterId, donorId] = chatId.split("_");

        const isRequester = requesterId === user.uid;
        const isDonor = donorId === user.uid;

        if (!isRequester && !isDonor) continue;

        // ============================
        // 1️⃣ Obtener la donación
        // ============================
        let donation = null;
        try {
          const resDonation = await axios.get(`${DONATION_API}/${donationId}`);
          donation = resDonation.data;
        } catch (err) {
          console.error("Error obteniendo donación:", err);
          continue;
        }

        // ============================
        // 2️⃣ Revisar si está vencida
        // ============================
        const expiration = new Date(donation.expirationDate);
        const isExpired = expiration < new Date();

        if (isExpired) {
          console.log("🔥 Eliminando chat vencido:", chatId);

          // eliminar mensajes primero
          const msgRef = collection(firestoreDb, "chats", chatDocId, "messages");
          const msgSnap = await getDocs(msgRef);

          for (const m of msgSnap.docs) {
            await deleteDoc(doc(firestoreDb, "chats", chatDocId, "messages", m.id));
          }

          // eliminar el chat
          await deleteDoc(doc(firestoreDb, "chats", chatDocId));
          continue; // no se agrega a la lista
        }

        // ============================
        // 3️⃣ Obtener usuario del otro lado
        // ============================
        const donorRes = await axios.get(`${USERS_API}/${donorId}`);
  const donorName = donorRes.data.name;
  const donorPhotoFinal = donorRes.data.photoUrl;

   const requesterRes = await axios.get(`${USERS_API}/${requesterId}`);
  const requesterName = requesterRes.data.name;
  const requesterPhotoFinal = requesterRes.data.photoUrl;
  const donationName = donation.description || donation.name || "Donación";

        // ============================
        // 4️⃣ Definir imágenes
        // ============================
        const donationImage =
          donation.images?.length > 0
            ? donation.images[0]
            : "https://cdn-icons-png.flaticon.com/512/3595/3595455.png";


        // ============================
        // 5️⃣ Unread
        // ============================
        const hasUnread = data.unreadFor?.includes(user.uid);

        list.push({
          chatDocId,
            chatId,
            donationName,
            donationImage,
            donorName,
            donorPhoto: donorPhotoFinal,
            requesterName,
            requesterPhoto: requesterPhotoFinal,
            hasUnread,
        });
      }

      setChats(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const CircleAvatar = ({ donationImg, requesterImg, donorImg }: any) => (
    <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md">
      <img
        src={donationImg}
        className="absolute top-0 left-0 w-full h-1/2 object-cover"
      />
      <img
        src={donorImg}
        className="absolute bottom-0 left-0 w-1/2 h-1/2 object-cover"
      />
      <img
        src={requesterImg}
        className="absolute bottom-0 right-0 w-1/2 h-1/2 object-cover"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5efe7]">
      <NavbarLogged />

      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mis Chats</h1>

        {loading ? (
          <p>Cargando chats...</p>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            No tienes chats todavía.
          </div>
        ) : (
          <div className="space-y-5">
            {chats.map((chat) => (
              <div
                key={chat.chatId}
                onClick={() => navigate(`/chat/${chat.chatDocId}`)}
                className={`relative w-full p-5 flex items-center gap-6 border rounded-2xl shadow 
                cursor-pointer transition-all duration-200
                ${
                  chat.hasUnread
                    ? "bg-[#ffe9dc] border-[#e66748] shadow-lg scale-[1.01]"
                    : "bg-white hover:bg-[#fff3e8] hover:scale-[1.01]"
                }`}
              >
                <CircleAvatar
                  donationImg={chat.donationImage}
                  requesterImg={chat.requesterPhoto}
                  donorImg={chat.donorPhoto}
                />

                <p className="text-xl font-semibold">{chat.donationName+" "+" "+ chat.donorName+" "+" "+chat.requesterName}</p>

                {chat.hasUnread && (
                  <span className="absolute right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-md">
                    Mensajes sin leer
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
