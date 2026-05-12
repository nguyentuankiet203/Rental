import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as dotenv from 'dotenv';


dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors({
    origin: "*",
  });
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  app.enableCors({
    origin: [
    "http://localhost:3000", 
    "https://rental-frontend-orcin.vercel.app",
    ],
    credentials: true,
  });
  const port = process.env.PORT || 3001;

  await app.listen(port);

  console.log(`Server running on port ${port}`);
}

bootstrap();