import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req, @Body() dto: LoginDto) {
    console.log('req.user:', req.user);  // Debug
    if (!req.user) {
      throw new Error('User not found after authentication');
    }
    return this.authService.login(req.user);
  }
}