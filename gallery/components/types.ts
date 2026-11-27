// Shapes shared by UiGallery and its sub-components (the listing and results from the gallery API).
export interface GalleryFile {
  name: string;
  size: number;
}
export interface GalleryFolder {
  folder: string;
  files: GalleryFile[];
}
export interface GalleryMeasure {
  size: number;
  w: number;
  h: number;
}
export interface GalleryResult {
  action: string;
  folder: string;
  name: string;
  out?: string;
  before?: GalleryMeasure;
  after?: GalleryMeasure;
  error?: string;
}
export type GalleryAction = 'trim' | 'bg' | 'optimize';
export const galleryKey = (folder: string, name: string) => `${folder}/${name}`;
export const galleryEnc = (folder: string) => folder.split('/').map(encodeURIComponent).join('/');
export const galleryKb = (bytes: number) =>
  bytes > 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
