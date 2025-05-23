import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { GetServicesDto, GetServicesReturnDto } from './dto/get-services.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private db: DatabaseService) {}

  create(createServiceDto: CreateServiceDto) {
    return this.db.service.create({ data: createServiceDto });
  }

  async findAll(params: GetServicesDto): Promise<GetServicesReturnDto> {
    const filters: Prisma.ServiceWhereInput = {};
    if (params.name) {
      filters.name = {
        contains: params.name,
      };
    }
    const currentPage = Number(params.page);
    const totalItems = await this.db.service.count({ where: filters });
    const prevPage = currentPage > 0 ? currentPage - 1 : 0;
    const items = await this.db.service.findMany({
      take: Number(params.limit),
      skip: params.limit * params.page,
      where: filters,
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

  findOne(id: number) {
    return this.db.service.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return this.db.service.update({
      where: {
        id: Number(id),
      },
      data: {
        description: updateServiceDto.description,
        duration: updateServiceDto.duration,
        name: updateServiceDto.name,
        price: updateServiceDto.price,
      },
    });
  }

  remove(id: number) {
    return this.db.service.delete({
      where: { id },
    });
  }
}
