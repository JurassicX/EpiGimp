export type ExportFormat = "png" | "jpeg" | "webp";

export const EXPORT_FORMATS: ExportFormat[] = ["png", "jpeg", "webp"];

export const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
};
