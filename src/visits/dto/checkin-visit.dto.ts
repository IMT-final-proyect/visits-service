import { ExceptionsDTO } from 'src/exceptions/exception.dto';

export class CheckInVisitDTO {
  vehicleId: number;
  driverId: number;
  securityId: number;
  arrivalTime: Date;
  palletsEntrada: number;
  palletsSalida: number;
  destiny: string;
  exceptionDto?: ExceptionsDTO;
}
