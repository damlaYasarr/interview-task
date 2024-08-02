import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://damlayasar40:eeUucaaomlKuaHXu@cluster0.ukb8dmk.mongodb.net/testconnect?retryWrites=true&w=majority'), // Update with your MongoDB URI
    UserModule,
   
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}