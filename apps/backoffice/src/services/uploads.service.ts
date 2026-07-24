import { request } from "./http"

export const uploadsService = {
  /** POST an image; the API stores it and returns its public /uploads path. */
  uploadImage: (file: File) => {
    const form = new FormData()
    form.append("file", file)
    return request<{ url: string }>("/uploads", { method: "POST", body: form })
  },
}
