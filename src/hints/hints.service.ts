import { Injectable } from '@nestjs/common';
import { GenerateHintsForUserDto } from './dto/generate-hints-for-user';
import { DatabaseService } from 'src/database/database.service';
import { PythonApiService } from 'src/python-api/python-api.service';

@Injectable()
export class HintsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly pythonApiService: PythonApiService,
  ) {}

  async generateHints(generateHintsForUserDto: GenerateHintsForUserDto) {
    const { userId } = generateHintsForUserDto;
    const appointments = await this.db.appointment.findMany({
      where: {
        clientId: userId,
      },
      // TODO: add to dto in future if need
      take: 5,
    });

    const notes = appointments
      .map((appointment) => {
        const match = appointment.note?.match(/\*\*(.*?)\*\*/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    console.log({
      notes,
    });
    return await this.pythonApiService.getRecommendation(notes);
  }
}
