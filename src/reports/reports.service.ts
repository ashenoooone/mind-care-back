import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { DatabaseService } from 'src/database/database.service';
import { GetReportsDto } from './dto/get-reports.dto';

@Injectable()
export class ReportsService {
  constructor(private db: DatabaseService) {}

  async create(createReportDto: CreateReportDto) {
    const client = await this.db.user.findUnique({
      where: {
        telegramId: createReportDto.telegramId,
      },
    });

    return this.db.supportRequest.create({
      data: {
        description: createReportDto.description,
        status: createReportDto.status,
        clientId: client.id,
      },
    });
  }

  async findAll(params: GetReportsDto) {
    const currentPage = Number(params.page);
    const totalItems = await this.db.supportRequest.count();
    const prevPage = currentPage > 0 ? currentPage - 1 : 0;

    const items = await this.db.supportRequest.findMany({
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

  findOne(id: number) {
    return this.db.supportRequest.findUnique({
      where: { id },
    });
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return this.db.supportRequest.update({
      where: {
        id,
      },
      data: {
        ...updateReportDto,
      },
    });
  }

  remove(id: number) {
    return this.db.supportRequest.delete({
      where: { id },
    });
  }
}
