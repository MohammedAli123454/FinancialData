// StudentPhotoStep.tsx
"use client";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

export default function StudentPhotoStep() {
  const { setValue, watch } = useFormContext();
  const photoUrl = watch("photoUrl");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      setUploadError("");
      let file = acceptedFiles[0];
      let compressedFile = file;
      let maxTries = 3;
      let targetSize = 200 * 1024;
      let maxWidthOrHeight = 1024;
      let lastError = "";

      for (let i = 0; i < maxTries; i++) {
        const options = {
          maxSizeMB: 0.19,
          maxWidthOrHeight,
          useWebWorker: true,
          initialQuality: 0.6,
        };
        try {
          compressedFile = await imageCompression(compressedFile, options);
          if (compressedFile.size <= targetSize) break;
        } catch (err) {
          lastError =
            err instanceof Error ? err.message : "Compression error";
          break;
        }
        maxWidthOrHeight = Math.floor(maxWidthOrHeight * 0.75);
      }

      if (compressedFile.size > targetSize) {
        setUploadError(
          "File could not be compressed below 200KB. Please choose a smaller image or crop it."
        );
        setUploading(false);
        return;
      }
      try {
        const form = new FormData();
        form.append("file", compressedFile);
        const res = await fetch("/api/upload-stud-image", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setValue("photoUrl", data.url, {
            shouldValidate: true,
            shouldDirty: true,
          });
        } else {
          setUploadError(data.error || "Upload failed");
        }
      } catch (err) {
        setUploadError("Upload failed. Try again.");
      }
      setUploading(false);
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[320px] p-6 bg-white rounded-lg shadow-md">
      <Label className="mb-2 text-lg font-semibold text-blue-700">
        Student Photo Upload
      </Label>
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Student Photo"
          className="rounded-full border-4 border-blue-100 shadow-md mb-4 object-cover"
          style={{ width: 120, height: 120 }}
        />
      )}
      <div
        {...getRootProps()}
        className={[
          "flex flex-col items-center justify-center w-full h-36",
          "bg-blue-50 border-2 border-dashed border-blue-400 rounded-lg",
          "transition-all duration-200 cursor-pointer",
          isDragActive ? "bg-blue-100 border-blue-600" : "hover:bg-blue-100",
          uploading ? "opacity-50 pointer-events-none" : "",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 mb-2 text-blue-400" />
        <span className="text-base font-medium mb-1 text-blue-700">
          {photoUrl
            ? "Change Photo"
            : isDragActive
            ? "Drop here…"
            : "Drag & Drop or Click to Upload"}
        </span>
        <span className="text-xs text-blue-400">
          Supported: JPG, PNG, JPEG — Max 2MB
        </span>
        <button
          type="button"
          onClick={open}
          className="mt-3 px-4 py-1 rounded bg-blue-500 text-white text-sm shadow hover:bg-blue-600"
          disabled={uploading}
        >
          {photoUrl ? "Change Photo" : "Select Photo"}
        </button>
      </div>
      {uploading && (
        <div className="flex items-center gap-2 text-blue-500 mt-4 text-sm">
          <Loader2 className="animate-spin w-5 h-5" />
          Uploading...
        </div>
      )}
      {uploadError && (
        <div className="text-xs text-red-500 mt-2">{uploadError}</div>
      )}
      {!photoUrl && !uploading && !uploadError && (
        <div className="text-gray-400 text-xs mt-4">
          No photo uploaded yet.
        </div>
      )}
    </div>
  );
}
