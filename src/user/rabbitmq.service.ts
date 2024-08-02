import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishMessage(exchange: string, routingKey: string, message: any) {
    await this.amqpConnection.publish(exchange, routingKey, message);
  }
}