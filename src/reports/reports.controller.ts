import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Serialize } from '../interceptors/serialize.interceptor';
import { User } from '../users/user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { CreateReportDto } from './dtos/CreateReport.dto';
import { ReportsService } from './reports.service';
import { ReportDto } from './dtos/report.dto';
import { ApproveReportDto } from './dtos/approveReport.dto';
import { AdminGuard } from '../guards/admin.guard';
import { GetEstimateDto } from './dtos/getEstimate.dto';

@Controller('reports')
export class ReportsController {
  constructor(private reportService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(
    @Body() body: CreateReportDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.reportService.create(body, currentUser);
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  approveReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
    return this.reportService.changeApproval(id, body.approved);
  }

  @Get()
  getEstimate(@Query() query: GetEstimateDto) {
    return this.reportService.createEstimate(query);
  }
}
