import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { parseAdminCredentials } from 'src/common/parse-admin-credentials';
import { randomUUID } from 'crypto';

@Injectable()
export class OwnerService {
  constructor(
    private db: DatabaseService,
    private config: ConfigService,
  ) {}

  async checkToken(token: string) {
    const settings = await this.db.serverSettings.findFirst();

    if (settings.adminToken !== token) throw new ForbiddenException();

    return 'ok';
  }

  async login(params: LoginDto): Promise<LoginResponseDto> {
    const { login, password } = parseAdminCredentials(
      this.config.get('ADMIN_CREDENTIALS'),
    );

    const correct = params.login === login && params.password === password;

    if (!correct) {
      throw new ForbiddenException();
    }
    const token = randomUUID();
    const settings = await this.db.serverSettings.findFirst();
    await this.db.serverSettings.update({
      where: { id: settings.id },
      data: { adminToken: token },
    });

    return { token };
  }
}
