"use client";

import { useState } from "react";
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, X } from "lucide-react";

export type ListingImageValue = { url: string; publicId?: string };

const CLOUD_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function ImageUploader({
  value,
  onChange,
  max = 12,
}: {
  value: ListingImageValue[];
  onChange: (images: ListingImageValue[]) => void;
  max?: number;
}) {
  const [urlDraft, setUrlDraft] = useState("");

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addUrl() {
    if (!urlDraft.trim()) return;
    if (value.length >= max) return;
    onChange([...value, { url: urlDraft.trim() }]);
    setUrlDraft("");
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((image, index) => (
            <div
              key={image.publicId ?? image.url}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`Foto ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remover foto"
              >
                <X className="size-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                  Capa
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {CLOUD_ENABLED ? (
        <CldUploadWidget
          uploadPreset={UPLOAD_PRESET}
          options={{ multiple: true, maxFiles: Math.max(max - value.length, 1), sources: ["local", "camera", "url"] }}
          onSuccess={(result: CloudinaryUploadWidgetResults) => {
            if (typeof result.info === "string" || !result.info) return;
            const info = result.info;
            onChange([
              ...value,
              { url: info.secure_url, publicId: info.public_id },
            ]);
          }}
        >
          {({ open }) => (
            <Button type="button" variant="outline" onClick={() => open()}>
              <ImagePlus /> Adicionar fotos
            </Button>
          )}
        </CldUploadWidget>
      ) : (
        <div className="rounded-lg border border-dashed p-3">
          <p className="mb-2 text-xs text-muted-foreground">
            Upload de imagem via Cloudinary não está configurado ainda. Por
            enquanto, cole a URL de uma imagem pública.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="https://exemplo.com/foto.jpg"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={addUrl}>
              Adicionar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
