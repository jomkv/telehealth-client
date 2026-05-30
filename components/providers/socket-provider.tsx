import { useUserStore } from "@/app/store";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const useSocketContext = () => {
  return useContext(SocketContext);
};

function SocketContextProvider({ children }: PropsWithChildren<unknown>) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useUserStore((s) => s.user);
  const hydrated = useUserStore((s) => s.hydrated);

  useEffect(() => {
    console.log("1");

    if (!user || !hydrated) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return;
    }

    console.log("2");

    if (!user?.id) return;

    console.log("3");

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      withCredentials: true,
      auth: { userId: user.id },
      autoConnect: true,
    });

    console.log("4", newSocket);

    setSocket(newSocket);

    console.log("5");

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    console.log("6");

    return () => {
      newSocket.close();
    };
  }, [user, hydrated]);

  return (
    <SocketContext.Provider
      value={{
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export default SocketContextProvider;
