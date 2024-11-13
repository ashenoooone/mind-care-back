import { Injectable } from '@nestjs/common';
import { Service } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { GetServicesDto, GetServicesReturnDto } from './dto/get-services.dto';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private db: DatabaseService) {}

  create(createServiceDto: CreateServiceDto) {
    return this.db.service.create({ data: createServiceDto });
  }

  async findAll(params: GetServicesDto): Promise<GetServicesReturnDto> {
    const currentPage = Number(params.page);
    const totalItems = await this.db.service.count();
    const prevPage = currentPage > 0 ? currentPage - 1 : 0;
    const items = await this.db.service.findMany({
      take: Number(params.limit),
      skip: params.limit * params.page,
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

  update(id: number, updateServiceDto: Service) {
    return this.db.service.update({
      where: {
        id: updateServiceDto.id,
      },
      data: {
        ...updateServiceDto,
      },
    });
  }

  remove(id: number) {
    return this.db.service.delete({
      where: { id },
    });
  }
}
