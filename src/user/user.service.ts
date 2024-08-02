import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.entity';
import { EmailService } from './email.service';
import { RabbitMQService } from './rabbitmq.service';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { getBase64 } from '../utils/utils'; 

@Injectable()
export class UserService {
  private readonly avatarDir = process.cwd() + '/avatars/'; // Directory to store avatar images

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  } 

  async delete(id: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatar && user.avatar.hash) {
      const filePath = join(this.avatarDir, user.avatar.hash);
      try {
        await unlink(filePath);
      } catch (error) {
 
        console.error('Failed to delete avatar file', error);
      }
    }

    await this.userModel.findByIdAndDelete(id).exec();
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = new this.userModel(user);
    const savedUser = await newUser.save();


    await this.emailService.sendUserCreationEmail(savedUser.email);

    await this.rabbitMQService.publishMessage(
      'exchange_name',
      'user_created', 
      {
        userId: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
      }
    );

    return savedUser;
  }


  async saveAvatar(userId: string, imageBuffer: Buffer, fileExtension: string = 'png'): Promise<string> {

    const hash = createHash('sha256').update(imageBuffer).digest('hex');
    

    const filePath = join(this.avatarDir, `${hash}.${fileExtension}`);
  

    await writeFile(filePath, imageBuffer);
  
    await this.userModel.findByIdAndUpdate(userId, {
      avatar: { hash, fileExtension },
    }).exec();
  
    return filePath; 
  }
  


  async getAvatar(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.avatar) {
      throw new NotFoundException('Avatar not found');
    }

    const filePath = join(this.avatarDir, user.avatar.hash);
    try {
      const base64 = await getBase64(filePath);
      return base64;
    } catch (error) {
      throw new NotFoundException('Avatar file not found');
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.avatar) {
      throw new NotFoundException('Avatar not found');
    }

    const filePath = join(this.avatarDir, user.avatar.hash);

 
    try {
      await unlink(filePath);
    } catch (error) {
      throw new NotFoundException('Avatar file not found');
    }


    await this.userModel.findByIdAndUpdate(userId, {
      avatar: null,
    }).exec();
  }
}
