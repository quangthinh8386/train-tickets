import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, UploadedFiles, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { storage } from './oss';
import * as path from 'path';
import * as fs from 'fs';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { console } from 'inspector';
import { count } from 'console';
import { Response } from 'express';
import { MyLogger } from 'src/logger/my.logger';
@Controller('user')
export class UserController {
  private logger = new MyLogger()
  constructor(private readonly userService: UserService) { }

  @Get('merge/file')
  mergefile(@Query("file") fileName: string, @Res() res: Response){
    const nameDir = 'uploads/' + fileName;

    // read
    const files = fs.readdirSync(nameDir)

    let startPos = 0, countFile = 0

    files.map(file => {
      const filePath = nameDir + "/" + file
      console.log("filePath |", filePath)
      const streamFile = fs.createReadStream(filePath)
      streamFile.pipe(fs.createWriteStream('uploads/merge/' + fileName, {
        start: startPos
      })).on('finish', ()=> {
        countFile++
        console.log('countFile |', countFile)
        if(files.length === countFile) {
          fs.rm(nameDir, {
            recursive: true
          }, () => {})
        }
      })

      startPos += fs.statSync(filePath).size
    })

    return res.json({
      link: `http://localhost:3000/uploads/merge/${fileName}`,
      fileName
    })
  }

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

    // remove
    fs.rmSync(files[0].path)
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
    this.logger.log("RegisterUserDto |", registerUserDto.accountname)
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
