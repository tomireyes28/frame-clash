// api/src/tmdb/tmdb.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { TmdbMovie } from './interfaces/tmdb.interface';

@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

 @Get('popular')
  async getPopularMovies(
    @Query('genre') genreId?: string,
    @Query('minYear') minYear?: string,
    @Query('maxYear') maxYear?: string,
  ): Promise<TmdbMovie[]> {
    return this.tmdbService.getPopularMovies(genreId, minYear, maxYear);
  }

  @Get('search')
  async searchMovie(@Query('q') query: string): Promise<TmdbMovie[]> {
    if (!query) return [];
    return this.tmdbService.searchMovie(query);
  }

}