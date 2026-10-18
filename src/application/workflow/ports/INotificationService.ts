export interface INotificationService {
    sendEmail(to: string, subject: string, body: string): Promise<void>;
    sendSMS(to: string, message: string): Promise<void>;
    sendWhatsApp(to: string, message: string): Promise<void>;
    sendPushNotification(userId: string, title: string, body: string): Promise<void>;
    sendInternalNotification(userId: string, title: string, body: string): Promise<void>;
}
