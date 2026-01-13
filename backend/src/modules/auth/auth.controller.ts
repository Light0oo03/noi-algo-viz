import { Body, Controller, Get, Inject, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';

const RegisterPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  expectedType: RegisterDto,
});

const LoginPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  expectedType: LoginDto,
});

@Controller('/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) { }

  @Post('/register')
  register(@Body(RegisterPipe) body: RegisterDto) {
    return this.auth.register(body);
  }

  @Post('/login')
  login(@Body(LoginPipe) body: LoginDto) {
    return this.auth.login(body);
  }

  @UseGuards(AuthGuard)
  @Post('/logout')
  logout(@Req() req: any) {
    // req.user is the JWT payload, sub is the user ID
    return this.auth.logout(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  me(@Req() req: any) {
    return { ok: true, user: req.user ?? null };
  }
}
