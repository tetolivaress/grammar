import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common"
import { panelSchema, roomSchema, roomUpdateSchema, type PanelContent } from "@grammar-museum/shared"
import { z } from "zod"
import { AuthGuard } from "../auth/auth.guard"
import { ZodPipe } from "../zod.pipe"
import { RoomsService } from "./rooms.service"

const roomCreateSchema = roomSchema

@Controller("rooms")
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  /** Public: the museum client renders from this. */
  @Get()
  list() {
    return this.rooms.list()
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body(new ZodPipe(roomCreateSchema)) body: z.infer<typeof roomCreateSchema>) {
    return this.rooms.create(body)
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodPipe(roomUpdateSchema)) body: z.infer<typeof roomUpdateSchema>,
  ) {
    return this.rooms.update(id, body)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.rooms.remove(id)
  }

  /** Create or replace the panel at (wall, slot). */
  @UseGuards(AuthGuard)
  @Put(":id/panels")
  upsertPanel(@Param("id") id: string, @Body(new ZodPipe(panelSchema)) body: PanelContent) {
    return this.rooms.upsertPanel(id, body)
  }

  @UseGuards(AuthGuard)
  @Delete(":id/panels/:wall/:slot")
  removePanel(
    @Param("id") id: string,
    @Param("wall") wall: string,
    @Param("slot", ParseIntPipe) slot: number,
  ) {
    return this.rooms.removePanel(id, wall, slot)
  }
}
