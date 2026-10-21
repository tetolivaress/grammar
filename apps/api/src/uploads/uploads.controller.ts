import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { MAX_UPLOAD_BYTES } from "@grammar-museum/shared"
import { randomBytes } from "node:crypto"
import { extname } from "node:path"
import { diskStorage } from "multer"
import { AuthGuard } from "../auth/auth.guard"
import { UPLOADS_DIR } from "../uploads.dir"

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])
const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"])

@Controller("uploads")
export class UploadsController {
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase()
          cb(null, `${Date.now()}-${randomBytes(6).toString("hex")}${ALLOWED_EXT.has(ext) ? ext : ".png"}`)
        },
      }),
      limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED.has(file.mimetype)) {
          return cb(new BadRequestException("Only PNG, JPEG, WebP or GIF images are allowed"), false)
        }
        cb(null, true)
      },
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("Attach an image in the 'file' field")
    return { url: `/uploads/${file.filename}` }
  }
}
