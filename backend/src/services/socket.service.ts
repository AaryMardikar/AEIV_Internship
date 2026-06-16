import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import logger from '../config/logger';
import { AuthTokenPayload } from '../types';

export class SocketService {
  private static io: SocketIOServer;
  // Map of userId -> Set of socketIds
  private static userSockets: Map<string, Set<string>> = new Map();

  /**
   * Initialize the Socket.IO server
   */
  static initialize(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // For dev. In production, configure properly.
        methods: ['GET', 'POST'],
      },
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const payload = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
        (socket as any).user = payload;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as AuthTokenPayload;
      const userId = user.userId;

      logger.info(`Socket connected: ${socket.id} for user ${userId}`);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id} for user ${userId}`);
        const userSet = this.userSockets.get(userId);
        if (userSet) {
          userSet.delete(socket.id);
          if (userSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });
    });
  }

  /**
   * Send a notification event to a specific user
   */
  static sendNotificationToUser(userId: string, eventName: string, payload: any) {
    if (!this.io) {
      logger.warn('SocketService is not initialized');
      return;
    }

    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds && userSocketIds.size > 0) {
      userSocketIds.forEach((socketId) => {
        this.io.to(socketId).emit(eventName, payload);
      });
      logger.debug(`Emitted ${eventName} to user ${userId} (${userSocketIds.size} sockets)`);
    } else {
      logger.debug(`User ${userId} is not connected to any sockets. Event ${eventName} skipped.`);
    }
  }
}
