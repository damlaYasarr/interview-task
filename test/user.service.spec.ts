import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../src/user/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/user/user.entity';
import { EmailService } from '../src/user/email.service';
import { RabbitMQService } from '../src/user/rabbitmq.service';


const mockUser = { 
  _id: 'someId', 
  username: 'testUser', 
  email: 'test@example.com', 
  avatar: { hash: 'hashValue', fileExtension: 'png' }
};


const mockUserModel = {
  findById: jest.fn().mockResolvedValue(mockUser),
  findByIdAndUpdate: jest.fn().mockResolvedValue(mockUser),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockUser),
  save: jest.fn().mockResolvedValue(mockUser),
  exec: jest.fn().mockResolvedValue(mockUser),
};

// Mock Services
const mockEmailService = {
  sendUserCreationEmail: jest.fn().mockResolvedValue(undefined),
};

const mockRabbitMQService = {
  publishMessage: jest.fn().mockResolvedValue(undefined),
};

describe('UserService Integration', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        EmailService,
        RabbitMQService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: EmailService, useValue: mockEmailService },
        { provide: RabbitMQService, useValue: mockRabbitMQService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should handle creating a user', async () => {
      const createUserDto = { username: 'testUser', email: 'test@example.com' };
      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
   
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      (mockUserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await service.findOne('someId');
      expect(result).toEqual(mockUser);
    });
  });
});
