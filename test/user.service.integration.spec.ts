import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../src/user/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/user/user.entity';
import { EmailService } from '../src/user/email.service';
import { RabbitMQService } from '../src/user/rabbitmq.service';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';
import { createHash } from 'crypto';
import { NotFoundException } from '@nestjs/common';
import { getBase64 } from '../src/utils/utils';

// Mock Data
const mockUser = { 
  _id: 'someId', 
  username: 'testUser', 
  email: 'test@example.com', 
  avatar: { hash: 'hashValue', fileExtension: 'png' }
};

// Mock Model
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

// Mock Utilities
const mockGetBase64 = jest.fn();

jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

describe('UserService Integration', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;
  const avatarDir = process.cwd() + '/avatars/';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost/nestjs-testing'),
      
      ],
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


    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    
  
    try {
      await unlink(join(avatarDir, 'hashValue.png'));
    } catch (error) {
     
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should handle creating a user', async () => {
      const createUserDto = { username: 'testUser', email: 'test@example.com' };
      const result = await service.create(createUserDto);
      expect(result).toHaveProperty('_id');
      expect(result.username).toBe(createUserDto.username);
    });
  });

  describe('saveAvatar', () => {
    it('should handle saving an avatar', async () => {
      const imageBuffer = Buffer.from('testImageBuffer');
      const filePath = join(avatarDir, 'hashValue.png');
      const hash = createHash('sha256').update(imageBuffer).digest('hex');
      
      mockGetBase64.mockResolvedValue('base64string');

      const result = await service.saveAvatar('someId', imageBuffer, 'png');
      expect(result).toBe(filePath);
    });
  });

  describe('getAvatar', () => {
    it('should handle retrieving an avatar', async () => {
      const base64 = 'base64string';
      mockGetBase64.mockResolvedValue(base64);
      
      const result = await service.getAvatar('someId');
      expect(result).toBe(base64);
    });

    it('should throw NotFoundException if avatar not found', async () => {
      jest.spyOn(service, 'getAvatar').mockRejectedValue(new NotFoundException('Avatar file not found'));
      
      await expect(service.getAvatar('someId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should handle deleting a user', async () => {
      await service.delete('someId');
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('someId');
    });
  });

  describe('deleteAvatar', () => {
    it('should handle deleting an avatar', async () => {
      const filePath = join(avatarDir, 'hashValue.png');
      await service.deleteAvatar('someId');
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('someId', { avatar: null });
    });
  });
});
