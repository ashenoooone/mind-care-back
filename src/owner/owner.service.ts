import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { parseAdminCredentials } from 'src/common/parse-admin-credentials';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OwnerService {
  constructor(
    private db: DatabaseService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  async checkToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const settings = await this.db.serverSettings.findFirst();

      if (settings.adminToken !== token) {
        throw new ForbiddenException();
      }

      return payload;
    } catch {
      throw new ForbiddenException();
    }
  }

  async login(params: LoginDto): Promise<LoginResponseDto> {
    const { login, password } = parseAdminCredentials(
      this.config.get('ADMIN_CREDENTIALS'),
    );

    const correct = params.login === login && params.password === password;

    if (!correct) {
      throw new UnauthorizedException();
    }

    const token = await this.jwtService.signAsync(
      { sub: 'admin', username: login },
      { secret: this.config.get('JWT_SECRET') },
    );

    const settings = await this.db.serverSettings.findFirst();
    await this.db.serverSettings.update({
      where: { id: settings.id },
      data: { adminToken: token },
    });

    return { token };
  }
}
