import { useEffect } from "react";
import { io } from "socket.io-client";

// Module-Level Singleton Socket Instance
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
export const riderSocket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
});

export function useRiderSocket({ riderId, queryClient }) {
  useEffect(() => {
    const handleJoin = () => {
      riderSocket.emit("join_room", "rider");
    };

    const invalidateAssigned = () => {
      if (queryClient && riderId) {
        queryClient.invalidateQueries({
          queryKey: ["rider_assigned_order", riderId],
        });
      }
    };

    if (riderSocket.connected) {
      handleJoin();
    } else {
      riderSocket.on("connect", handleJoin);
    }

    riderSocket.on("refresh_rider", invalidateAssigned);
    riderSocket.on("trigger_rider_assignment", invalidateAssigned);
    riderSocket.on("order_status_updated", invalidateAssigned);

    return () => {
      riderSocket.off("connect", handleJoin);
      riderSocket.off("refresh_rider", invalidateAssigned);
      riderSocket.off("trigger_rider_assignment", invalidateAssigned);
      riderSocket.off("order_status_updated", invalidateAssigned);
    };
  }, [queryClient, riderId]);

  return riderSocket;
}
