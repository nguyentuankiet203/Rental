import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
  Param,
  UseGuards,
  Patch,
  ParseIntPipe, Req
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";

import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

import { Role } from "../common/enum/role.enum";

import { UserService } from "./user.service";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("users")
export class UsersController {
  constructor(
    private readonly userService: UserService,
  ) {}

  // GET ALL USERS

  @Get()
  @Roles(Role.ADMIN, Role.LANDLORD)
  findAll(
    @Query() query: any,
    @Req() req: any,
  ) {
    return this.userService.findAll(query, req.user);
  }

  // CREATE USER

  @Post()
  @UseInterceptors(FileInterceptor("avatar"))
  @Roles(Role.ADMIN, Role.LANDLORD)
  createUser(
    @Body() dto: CreateUserDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.createUser(
      dto,
      req.user,
      file,
    );
  }

  // UPDATE USER

  @Patch(":id")
  @Roles(Role.ADMIN, Role.LANDLORD, Role.TENANT)
  @UseInterceptors(FileInterceptor("avatar"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(id, dto, file);
  }

  // DELETE USER

  @Delete(":id")
  @Roles(Role.ADMIN, Role.LANDLORD)
  deleteUser(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.userService.deleteUser(id);
  }
}