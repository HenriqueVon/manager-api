import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {      
      return response.status(exception.getStatus()).json(exception.getResponse());
    } else if (exception instanceof QueryFailedError) {      
      const message = exception.message;

      if (message.search('FK_') > 0) {
        return response.status(HttpStatus.BAD_REQUEST).json({
            message: "Related item not found. Please verify the foreign key constraints.",
          });        
      }

      if (message.search ('UQ_') > 0){
        return response.status(HttpStatus.CONFLICT).json({
            message: "Item already exists",
          });        
      }
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}