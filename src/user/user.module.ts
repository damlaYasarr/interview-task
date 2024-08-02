import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { User, UserSchema } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EmailService } from './email.service';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', 
        port: 587,
        secure: false, 
        auth: {
          user: 'damlaprotel17@gmail.com',  // this is mine temporary email
          pass: 'axar kbcv mcta jrhf',
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@example.com>',
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'exchange_name',
          type: 'direct',
        },
      ],
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [UserService, EmailService, RabbitMQService],
  controllers: [UserController],
})
export class UserModule {}
