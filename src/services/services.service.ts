import { Injectable } from '@nestjs/common';
import { Prisma, Service } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { GetServicesDto } from './dto/get-services.dto';

@Injectable()
export class ServicesService {
  constructor(private db: DatabaseService) {}

  create(createServiceDto: Prisma.ServiceCreateInput) {
    return this.db.service.create({ data: createServiceDto });
  }

  findAll(params: GetServicesDto) {
    return this.db.service.findMany({
      take: Number(params.limit),
      skip: params.limit * params.page,
    });
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
