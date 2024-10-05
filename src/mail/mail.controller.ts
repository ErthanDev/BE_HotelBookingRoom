import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from 'src/decorators/customize';
import { CreateMailDto } from './dto/create-mail.dto';


@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  @Get()
  @Public()
  sendMail() {
    const createMailDto: CreateMailDto = new CreateMailDto();
    this.mailService.sendMail(createMailDto);
  }
}
