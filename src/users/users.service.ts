import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  create(createUserDto: Prisma.UserCreateInput) {
    return this.db.user.create({ data: createUserDto });
  }

  findAll() {
    return this.db.user.findMany();
  }

  findOne(id: number) {
    return this.db.user.findUnique({ where: { id } });
  }

  update(id: number, updateUserDto: User) {
    return this.db.user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return this.db.user.delete({ where: { id } });
  }
}
