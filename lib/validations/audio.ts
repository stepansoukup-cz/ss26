import {
  MAX_AUDIO_UPLOAD_BYTES,
  maxAudioUploadErrorMessage,
} from "@/lib/audio-upload";

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
]);

const ALLOWED_AUDIO_EXTENSIONS = new Set([".mp3", ".wav"]);

function fileExtension(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

export function validateAudioFile(file: File) {
  const extension = fileExtension(file.name);
  const typeOk =
    ALLOWED_AUDIO_TYPES.has(file.type) ||
    ALLOWED_AUDIO_EXTENSIONS.has(extension);

  if (!typeOk) {
    return "Povolené formáty: MP3 a WAV.";
  }

  if (file.size > MAX_AUDIO_UPLOAD_BYTES) {
    return maxAudioUploadErrorMessage();
  }

  if (file.size === 0) {
    return "Soubor je prázdný.";
  }

  return null;
}

export function getAudioFileFromFormData(formData: FormData, fieldName = "file") {
  const value = formData.get(fieldName);

  if (!(value instanceof File)) {
    return { error: "Vyber audio soubor k nahrání." };
  }

  const validationError = validateAudioFile(value);
  if (validationError) {
    return { error: validationError };
  }

  return { file: value };
}

const ALLOWED_AUDIO_EXTS = new Set(["mp3", "wav"]);

export async function checkAudioMagicBytes(buffer: Buffer): Promise<string | null> {
  const { fileTypeFromBuffer } = await import("file-type");
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !ALLOWED_AUDIO_EXTS.has(type.ext)) {
    return "Soubor není platný audio soubor. Povolené formáty: MP3, WAV.";
  }
  return null;
}

export function sanitizeAudioCaption(raw: string) {
  return raw.replace(/\s+/g, " ").trim().slice(0, 200);
}
