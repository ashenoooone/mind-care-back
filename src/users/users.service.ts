import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { GetUsersDto } from './dto/get-users.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  create(createUserDto: CreateUserDto) {
    return this.db.user.create({
      data: {
        ...createUserDto,
        id: createUserDto.telegramId,
      },
    });
  }

  async findAll(params: GetUsersDto) {
    const currentPage = Number(params.page);
    const prevPage = currentPage > 0 ? currentPage - 1 : 0;
    const filters: Prisma.UserWhereInput = {};

    if (params.name) {
      filters.OR = [
        { name: { contains: params.name } },
        { name: { equals: params.name } },
        { tgNickname: { equals: params.name } },
        { tgNickname: { contains: params.name } },
      ];
    }

    const items = await this.db.user.findMany({
      take: Number(params.limit),
      skip: Number(params.limit) * currentPage,
      where: filters,
    });

    const totalItems = await this.db.user.count({ where: filters });
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
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            id: +id,
          },
          {
            telegramId: +id,
          },
        ],
      },
    });
    if (!user) throw new NotFoundException();
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.db.user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return this.db.user.delete({ where: { id } });
  }
}
