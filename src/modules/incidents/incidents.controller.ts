import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  HttpCode,
  Query,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { SearchIncidentDto } from './dto/search-incident.dto';
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  //Route tinh
  //SEARCH, FILTER, PAGINATION
  @Get('search')
  searchIncidents(@Query() query: SearchIncidentDto) {
    return this.incidentsService.searchIncidents(query);
  }
  //Recycle Bin
  @Get('deleted')
  findDeleted() {
    return this.incidentsService.findDeleted();
  }

  //CRUD
  @Post()
  create(@Body() createIncidentDto: CreateIncidentDto) {
    return this.incidentsService.create(createIncidentDto);
  }

  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
  ) {
    return this.incidentsService.update(id, updateIncidentDto);
  }

  // Soft delete an incident
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }

  // Restore a soft-deleted incident
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.incidentsService.restore(id);
  }

  //Hard delete an incident
  @Delete(':id/hard')
  @HttpCode(204)
  async hardDelete(@Param('id') id: string) {
    await this.incidentsService.hardDelete(id);
  }
}
