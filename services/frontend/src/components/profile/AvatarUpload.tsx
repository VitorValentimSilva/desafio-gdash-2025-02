import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type AvatarUploadProps = {
  initialUrl?: string | null;
  onFile?: (file: File | null) => void;
  accept?: string;
  maxFileSizeMB?: number;
};

export default function AvatarUpload({
  initialUrl = null,
  onFile,
  accept = "image/*",
  maxFileSizeMB = 5,
}: AvatarUploadProps) {
  const { t } = useTranslation("user");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function validateFile(file: File) {
    if (!file.type.startsWith("image/")) {
      return t("formCreate.justImageText");
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      return t("formCreate.maxMBText", { maxMB: maxFileSizeMB });
    }
    return null;
  }

  function handleFiles(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) {
      onFile?.(null);
      return;
    }
    const f = files[0];
    const err = validateFile(f);
    if (err) {
      setError(err);
      onFile?.(null);
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
    onFile?.(f);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer ${
          dragOver ? "border-dashed border-blue-400" : "border-gray-200"
        }`}
        role="button"
        tabIndex={0}
      >
        <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-500">
              {t("formCreate.noImage")}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              id="file"
              onClick={() => inputRef.current?.click()}
            >
              {t("formCreate.fileToChoose")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (preview && preview.startsWith("blob:"))
                  URL.revokeObjectURL(preview);
                setPreview(null);
                onFile?.(null);
              }}
            >
              {t("formCreate.hidePhoto")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t("formCreate.dragDropText", { maxMB: maxFileSizeMB })}
          </p>
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
