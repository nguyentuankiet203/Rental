import { Controller, Get, Post, Body, Patch, Delete, Req, Param, UseGuards,
  UploadedFile, UseInterceptors, ParseIntPipe
 } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enum/role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';


@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('properties')
export class PropertyController {
  constructor(
    private readonly service: PropertyService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  @Roles(Role.ADMIN, Role.LANDLORD)
  async create(
    @GetUser() user,
    @Body() dto: CreatePropertyDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.service.create(user, dto, file);
  }

  @Get(":propertyId")
  findByProperty(
    @GetUser() user,
    @Param("propertyId") propertyId: string
  ) {
    return this.service.findOne(user, +propertyId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LANDLORD)
  findAll(@Req() req) {
    return this.service.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  findOne(@Req() req, @Param('id') id: string) {
    return this.service.findOne(req.user, +id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @Roles(Role.ADMIN, Role.LANDLORD)
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user,
    @Body() dto: Partial<CreatePropertyDto>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file);

    return this.service.update(
      user,
      id,
      dto,
      file,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.LANDLORD)
  remove(@Req() req, @Param('id') id: string) {
    return this.service.remove(req.user, +id);
  }
}