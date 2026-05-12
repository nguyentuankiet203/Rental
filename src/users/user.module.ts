import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UsersController } from './user.controller';
import { UploadModule } from "src/upload/upload.module";
@Module({
  imports: [TypeOrmModule.forFeature([User])
  ,UploadModule],
  providers: [UserService],
  exports: [UserService],  
  controllers: [UsersController],

})
export class UserModule {}