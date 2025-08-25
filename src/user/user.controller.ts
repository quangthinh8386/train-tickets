import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, UploadedFiles } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { storage } from './oss';
import * as path from 'path';
import * as fs from 'fs';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('upload/large-file')
  @UseInterceptors(FilesInterceptor('files', 20, {
    dest: 'uploads',
  }))

  uploadLargeFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
    console.log('upload file body |', body);
    console.log('upload files |', files);

    // get file name
    const fileName = body.name.match(/(.+)-\d+$/)?.[1] ?? body.name;
    const nameDir = 'uploads/chunks-' + fileName;

    // mkdir
    if (!fs.existsSync(nameDir)) {
      fs.mkdirSync(nameDir);
    }

    // copy
    fs.cpSync(files[0].path, nameDir + '/' + body.name);
  }

  @Post('upload/avt')
  @UseInterceptors(FileInterceptor('file', {
    dest: 'uploads/avatar',
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 3 },
    fileFilter(req, file, cb) {
      const extName = path.extname(file.originalname)
      if (['.jpg', '.png', '.gif'].includes(extName)) {
        cb(null, true);
      } else {
        cb(new BadRequestException("Upload file Error"), false);
      }
    }
  }))

  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file.path);
    return file.path
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    console.log(loginUserDto);
    return this.userService.login(loginUserDto);
  }

  @Post('new')
  register(@Body() registerUserDto: RegisterUserDto) {
    console.log(registerUserDto);
    return this.userService.register(registerUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
