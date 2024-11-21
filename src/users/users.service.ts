import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { GetUsersDto } from './dto/get-users.dto';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  create(createUserDto: CreateUserDto) {
    return this.db.user.create({ data: createUserDto });
  }

  async findAll(params: GetUsersDto) {
    const currentPage = Number(params.page);
    const totalItems = await this.db.user.count();
    const prevPage = currentPage > 0 ? currentPage - 1 : 0;

    const items = await this.db.user.findMany({
      take: Number(params.limit),
      skip: Number(params.limit) * currentPage,
    });

    const totalPages = Math.floor(totalItems / params.limit);

    const nextPage = currentPage < totalPages ? currentPage + 1 : currentPage;

    return {
      meta: {
        currentPage,
        nextPage,
        totalItems,
        prevPage,
        totalPages,
      },
      items,
    };
  }

  async findOne(id: number) {
    const userByIdFromDb = await this.db.user.findUnique({ where: { id } });
    if (userByIdFromDb) return userByIdFromDb;
    const userByIdFromTg = await this.db.user.findUnique({
      where: {
        telegramId: id,
      },
    });
    return userByIdFromTg;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.db.user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return this.db.user.delete({ where: { id } });
  }
}
