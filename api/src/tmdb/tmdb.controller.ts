import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { TmdbMovie } from './interfaces/tmdb.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('tmdb')
@UseGuards(JwtAuthGuard, AdminGuard) // 🛡️ Evitamos que jugadores vivos gasten tu cuota gratuita de la API de TMDB
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