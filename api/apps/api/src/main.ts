import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { RpcExceptionFilter } from '../../../libs/shared/src/filter/rpcexception.filter';
const Fingerprint = require('express-fingerprint')

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Messenger-Clone')
    .setDescription('Messenger Clone API')
    .setVersion('1.0')
    .addBearerAuth(
      { 
        // I was also testing it without prefix 'Bearer ' before the JWT
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer', // I`ve tested not to use this field, but the result was the same
        scheme: 'Bearer',
        type: 'http', // I`ve attempted type: 'apiKey' too
        in: 'Header'
      },
      'access-token',
    )
    .build()
  // app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalPipes(new ValidationPipe())
  app.use(Fingerprint({
    parameters: [
      Fingerprint.useragent,
      Fingerprint.acceptHeaders,
      Fingerprint.geoip,
    ]
  }))
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      callback(null, true);
      return;
    },
  }
  app.enableCors(corsOptions);
  await app.listen(5000);
}
bootstrap();
