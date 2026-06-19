/** Limity pro nahrávání audio stop do článku. */

export const MAX_AUDIO_UPLOAD_BYTES = 50 * 1024 * 1024;
export const MAX_AUDIO_UPLOAD_MB = 50;

export function maxAudioUploadErrorMessage() {
  return `Audio soubor je příliš velký (max. ${MAX_AUDIO_UPLOAD_MB} MB).`;
}

export function audioUploadHint() {
  return `MP3 nebo WAV do ${MAX_AUDIO_UPLOAD_MB} MB — nahrává se přes server do Cloudinary.`;
}
