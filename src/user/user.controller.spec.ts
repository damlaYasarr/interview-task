import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailService } from './email.service';
import { RabbitMQService } from './rabbitmq.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock UserService
const mockUserService = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue(null),
  saveAvatar: jest.fn().mockResolvedValue(null),
  getAvatar: jest.fn().mockResolvedValue('base64string'),
  delete: jest.fn().mockResolvedValue(undefined),
  deleteAvatar: jest.fn().mockResolvedValue(undefined),
};

// Mock EmailService
const mockEmailService = {
  sendUserCreationEmail: jest.fn().mockResolvedValue(undefined),
};

// Mock RabbitMQService
const mockRabbitMQService = {
  publishMessage: jest.fn().mockResolvedValue(undefined),
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: RabbitMQService, useValue: mockRabbitMQService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { username: 'testUser', email: 'test@example.com' };
      jest.spyOn(userService, 'findOne').mockResolvedValue(user as any);

      const result = await controller.findOne('someId');
      expect(result).toEqual(user);
      expect(userService.findOne).toHaveBeenCalledWith('someId');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne('someId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = { username: 'testUser', email: 'test@example.com' };
      const result = { _id: 'someId', ...createUserDto };
      jest.spyOn(userService, 'create').mockResolvedValue(result as any);

      const response = await controller.create(createUserDto);
      expect(response).toEqual(result);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getAvatar', () => {
    it('should return base64 string for the avatar', async () => {
      const base64 = 'base64string';
      jest.spyOn(userService, 'getAvatar').mockResolvedValue(base64);

      const result = await controller.getAvatar('someId');
      expect(result).toBe(base64);
      expect(userService.getAvatar).toHaveBeenCalledWith('someId');
    });

    it('should throw NotFoundException if avatar not found', async () => {
      jest.spyOn(userService, 'getAvatar').mockRejectedValue(new NotFoundException('Avatar not found'));

      await expect(controller.getAvatar('someId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload an avatar', async () => {
      const file = { buffer: Buffer.from('testImageBuffer') } as Express.Multer.File;
      const filePath = 'somePath.png';
      jest.spyOn(userService, 'saveAvatar').mockResolvedValue(filePath);

      const result = await controller.uploadAvatar('someId', file);
      expect(result).toBe(filePath);
      expect(userService.saveAvatar).toHaveBeenCalledWith('someId', file.buffer);
    });

    it('should throw BadRequestException if no file is uploaded', async () => {
      await expect(controller.uploadAvatar('someId', null as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      await controller.deleteAvatar('someId');
      expect(userService.deleteAvatar).toHaveBeenCalledWith('someId');
    });
  });

  describe('deleteAvatar', () => {
    it('should delete an avatar', async () => {
      await controller.deleteAvatar('someId');
      expect(userService.deleteAvatar).toHaveBeenCalledWith('someId');
    });
  });
});
