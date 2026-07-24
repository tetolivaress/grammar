import { useMutation } from "@tanstack/react-query"
import { uploadsService } from "../services/uploads.service"

/** Image upload — no cache to invalidate; the caller stores the returned URL. */
export function useUploadImage() {
  return useMutation({ mutationFn: uploadsService.uploadImage })
}
