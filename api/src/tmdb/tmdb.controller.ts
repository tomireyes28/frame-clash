import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('tmdb')
@UseGuards(JwtAuthGuard, AdminGuard) // 🛡️ Evitamos que jugadores vivos gasten tu cuota gratuita de la API de TMDB
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  

  @Get('popular')
  async getPopular(
    @Query('genre') genre?: string,
    @Query('minYear') minYear?: string,
    @Query('maxYear') maxYear?: string,
    @Query('page') page?: string, // 👈 Recibimos la página
  ) {
    const chunk = page ? parseInt(page, 10) : 1;
    return this.tmdbService.getPopularMovies(genre, minYear, maxYear, chunk);
  }

  @Get('search')
  async search(@Query('q') query: string, @Query('page') page?: string) {
    const chunk = page ? parseInt(page, 10) : 1;
    return this.tmdbService.searchMovie(query, chunk);
  }
}