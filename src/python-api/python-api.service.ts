import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PythonApiService {
  constructor(private readonly httpService: HttpService) {}

  async getRecommendation(notes: string[]) {
    const response = await this.httpService.axiosRef.post(
      '/get_recommendation',
      { notes },
    );
    return response.data;
  }
}
