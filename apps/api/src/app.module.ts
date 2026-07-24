import { Module } from "@nestjs/common"
import { ServeStaticModule } from "@nestjs/serve-static"
import { RoomsController } from "./rooms/rooms.controller"
import { RoomsService } from "./rooms/rooms.service"
import { UploadsController } from "./uploads/uploads.controller"
import { UPLOADS_DIR } from "./uploads.dir"

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: UPLOADS_DIR,
      serveRoot: "/uploads",
      serveStaticOptions: { index: false, fallthrough: false },
    }),
  ],
  controllers: [RoomsController, UploadsController],
  providers: [RoomsService],
})
export class AppModule {}
