import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.entity';
import { EmailService } from './email.service';
import { RabbitMQService } from './rabbitmq.service';

// Mock UserModel
const mockUserModel = {
  findById: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  findByIdAndDelete: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockResolvedValue(null),
  exec: jest.fn().mockResolvedValue(null),
};

// Mock EmailService
const mockEmailService = {
  sendUserCreationEmail: jest.fn().mockResolvedValue(undefined),
};

// Mock RabbitMQService
const mockRabbitMQService = {
  publishMessage: jest.fn().mockResolvedValue(undefined),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: EmailService, useValue: mockEmailService },
        { provide: RabbitMQService, useValue: mockRabbitMQService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});