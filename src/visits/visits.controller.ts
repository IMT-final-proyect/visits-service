import { Controller, Logger } from '@nestjs/common';
import { CheckInVisitDTO } from './dto/checkin-visit.dto';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { VisitDTO } from './dto/visit.dto';
import { checkOutInterface } from './interfaces/checkout.interface';
import { Header } from './interfaces/header.interface';
import { VisitQPs } from './qps/visit.qps';
import { VisitsService } from './visits.service';

@Controller('visits')
export class VisitsController {
  private readonly logger = new Logger(VisitsController.name);

  constructor(private visitsService: VisitsService) {}

  @MessagePattern('visits_find_all')
  async findAll(visitQPs: VisitQPs): Promise<VisitDTO[]> {
    this.logger.debug('Find all', { visitQPs });
    return this.visitsService.findAll(visitQPs);
  }

  @MessagePattern('visits_find_one')
  async findOne({ id, visitQPs }: Header): Promise<VisitDTO> {
    this.logger.debug('Get Visit by id ', { id, visitQPs });
    return this.visitsService.findOne(id, visitQPs);
  }

  @MessagePattern('visit_create')
  async create(dto: CheckInVisitDTO): Promise<VisitDTO> {
    this.logger.debug('Attempting to create visit for', dto);
    return this.visitsService.create(dto.securityId, dto.driverId, dto.vehicleId);
  }

  @MessagePattern('visits_resource_exit')
  async resourceExit({
    vehicleId,
    driverId,
    checkOut
  }: checkOutInterface): Promise<VisitDTO> {
    this.logger.debug('Resource exiting ', { vehicleId, driverId, checkOut });
    try {
      const checkIns = await this.visitsService.getCheckOut(
        vehicleId,
        driverId,
        checkOut
      );
      if (!checkIns.length) {
        this.logger.error(
          'There are no checkIns from the pair vehicle/driver today.',
          { vehicleId, driverId }
        );
        throw new RpcException({
          message: `No se a encontrado un ingreso previo a la salida`
        });
      } else if (checkIns.length > 1) {
        this.logger.error(
          'There are more than one checkIns for the pair vehicle/driver today.',
          { vehicleId, driverId }
        );
      }
      const { id } = checkIns[0];
      this.logger.debug('Previous checkIn: ', checkIns[0]);
      return this.visitsService.update(id, { id, checkOut });
    } catch (error) {
      this.logger.error('Error CheckingOut visit', {
        vehicleId,
        driverId,
        checkOut
      });
      throw new RpcException({
        message: `Ha ocurrido un error al registrar la salida`
      });
    }
  }
}
