import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimitGuard } from '../common/rate-limit.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

// Rate limits below close a previously documented gap (see
// docs/SECURITY.md, "No rate limiting or brute-force protection on
// /api/auth/login") with a real, enforced, unit-tested guard — see
// docs/SECURITY.md for what this guard does and does not protect against.
const LOGIN_LIMIT = new RateLimitGuard(10, 60_000); // 10 attempts / IP / minute
const REGISTER_LIMIT = new RateLimitGuard(5, 60_000); // 5 attempts / IP / minute

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @UseGuards(REGISTER_LIMIT)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @UseGuards(LOGIN_LIMIT)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
