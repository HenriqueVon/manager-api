import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private configService: ConfigService;

  constructor(configService: ConfigService) {    
    this.configService = configService;

    const nameService = this.configService.get('EMAIL_NAME_SERVICE');
    const user        = this.configService.get('EMAIL_USER');
    const pass        = this.configService.get('EMAIL_PASS');
    const host        = this.configService.get('EMAIL_SMTP');
    const port        = this.configService.get('EMAIL_PORT');

    if (!nameService || !user || !pass || !host || !port) {
      throw new Error('Incomplete email configuration. Please check your ConfigService.');
    }    

    this.transporter = nodemailer.createTransport({
      // Set up your email provider configuration here      
      service: nameService,
      host: host,
      port: port,
      auth: {
        user: user,
        pass: pass,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {    
    try {      
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM_NAME') + ' <' + this.configService.get('EMAIL_FROM') + '>',
        to,
        subject,
        text,        
      });
      console.log('Email sent successfully.');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
