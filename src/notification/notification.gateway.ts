import {
  WebSocketGateway,
  WebSocketServer,
  // SubscribeMessage,
  // OnGatewayConnection,
  // OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})


export class NotificationGateway {

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;

    console.log("🔥 auth:", client.handshake.auth);

    if (!userId) {
      console.log("❌ no userId");
      client.disconnect();
      return;
    }

    client.join(`user_${userId}`);

    console.log(`✅ joined room user_${userId}`);
  }

  sendToUser(userId: number, payload: any) {
    this.server.to(`user_${userId}`).emit("notification", payload);
  }
}