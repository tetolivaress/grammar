import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { MAX_BODY_ITEMS, panelSchema, type PanelContent, type Wall } from "@grammar-museum/shared"
import { API_URL, ApiError } from "./services/http"
import { useDeletePanel, useUpsertPanel } from "./hooks/rooms.hooks"
import { useUploadImage } from "./hooks/uploads.hooks"

const formSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(60),
  subtitle: z.string().trim().max(170),
  bodyText: z
    .string()
    .trim()
    .min(1, "Add at least one line")
    .refine((t) => t.split("\n").filter((l) => l.trim()).length <= MAX_BODY_ITEMS, {
      message: `Maximum ${MAX_BODY_ITEMS} lines`,
    })
    .refine((t) => t.split("\n").every((l) => l.trim().length <= 240), {
      message: "Lines can have at most 240 characters",
    }),
  footnote: z.string().trim().max(220),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  roomId: string
  wall: Wall
  slot: number
  panel: PanelContent | null
  onClose: () => void
}

export function PanelForm({ roomId, wall, slot, panel, onClose }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(panel?.imageUrl ?? null)
  const [serverError, setServerError] = useState<string | null>(null)
  const upsertPanel = useUpsertPanel()
  const deletePanel = useDeletePanel()
  const uploadImage = useUploadImage()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      title: panel?.title ?? "",
      subtitle: panel?.subtitle ?? "",
      bodyText: panel?.body.join("\n") ?? "",
      footnote: panel?.footnote ?? "",
    },
  })

  async function handleUpload(file: File | undefined) {
    if (!file) return
    setServerError(null)
    try {
      const { url } = await uploadImage.mutateAsync(file)
      setImageUrl(url)
    } catch (e) {
      setServerError(e instanceof ApiError ? e.fullMessage : "Upload failed")
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    const candidate = {
      wall,
      slot,
      title: values.title,
      subtitle: values.subtitle || null,
      body: values.bodyText.split("\n").map((l) => l.trim()).filter(Boolean),
      footnote: values.footnote || null,
      imageUrl,
    }
    const parsed = panelSchema.safeParse(candidate)
    if (!parsed.success) {
      setServerError(parsed.error.issues.map((i) => i.message).join(" · "))
      return
    }
    try {
      await upsertPanel.mutateAsync({ roomId, panel: parsed.data })
      onClose()
    } catch (e) {
      setServerError(e instanceof ApiError ? e.fullMessage : "Saving failed")
    }
  })

  async function handleDelete() {
    if (!panel) return onClose()
    if (!confirm(`Delete the panel at ${wall} · slot ${slot + 1}?`)) return
    try {
      await deletePanel.mutateAsync({ roomId, wall, slot })
      onClose()
    } catch (e) {
      setServerError(e instanceof ApiError ? e.fullMessage : "Deleting failed")
    }
  }

  const busy = upsertPanel.isPending || deletePanel.isPending || uploadImage.isPending

  return (
    <form className="card panel-form" onSubmit={onSubmit}>
      <header>
        <h3>
          Panel — {wall} wall · slot {slot + 1}
        </h3>
        <button type="button" className="link" onClick={onClose}>
          Close
        </button>
      </header>

      <label>
        Title
        <input type="text" {...register("title")} placeholder="Zero Conditional" />
        {errors.title && <span className="error">{errors.title.message}</span>}
      </label>
      <label>
        Subtitle / formula <span className="muted">(optional)</span>
        <input type="text" {...register("subtitle")} placeholder="If + present simple, present simple" />
        {errors.subtitle && <span className="error">{errors.subtitle.message}</span>}
      </label>
      <label>
        Body — one example per line (max {MAX_BODY_ITEMS})
        <textarea rows={6} {...register("bodyText")} placeholder={"If it rains, the ground gets wet.\nPlants die if they don't get water."} />
        {errors.bodyText && <span className="error">{errors.bodyText.message}</span>}
      </label>
      <label>
        Footnote <span className="muted">(optional)</span>
        <input type="text" {...register("footnote")} />
        {errors.footnote && <span className="error">{errors.footnote.message}</span>}
      </label>

      <div className="image-field">
        <span>Wall image</span>
        {imageUrl ? (
          <div className="image-preview">
            <img src={`${API_URL}${imageUrl}`} alt="Panel" />
            <button type="button" className="link danger" onClick={() => setImageUrl(null)}>
              Remove image
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => handleUpload(e.target.files?.[0])}
            disabled={uploadImage.isPending}
          />
        )}
        {uploadImage.isPending && <span className="muted">Uploading…</span>}
      </div>

      {serverError && <p className="error">{serverError}</p>}

      <footer>
        <button type="submit" disabled={busy}>
          Save panel
        </button>
        {panel && (
          <button type="button" className="danger" disabled={busy} onClick={handleDelete}>
            Delete
          </button>
        )}
      </footer>
    </form>
  )
}
