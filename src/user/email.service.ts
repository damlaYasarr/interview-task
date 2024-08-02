import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserCreationEmail(userEmail: string): Promise<void> {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Welcome to Our Service',
      template: './welcome',
      context: {
        userEmail,
      },
    });
  }
}
