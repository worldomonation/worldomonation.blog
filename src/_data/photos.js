import { readdir, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import exifr from "exifr";

const PHOTOS_DIR = "src/photos";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tiff"]);

export default async function () {
  let files;
  try {
    files = await readdir(PHOTOS_DIR);
  } catch {
    return [];
  }

  const imageFiles = files.filter(
    (f) => !f.startsWith(".") && IMAGE_EXTENSIONS.has(extname(f).toLowerCase())
  );

  const photos = await Promise.all(
    imageFiles.map(async (filename) => {
      const filepath = join(PHOTOS_DIR, filename);
      const fileStat = await stat(filepath);

      let exif = {};
      try {
        const data = await exifr.parse(filepath, {
          tiff: true,
          exif: true,
          iptc: true,
          xmp: true,
          gps: true,
        });
        if (data) {
          exif = {
            camera: formatCamera(data.Make, data.Model),
            lens: data.LensModel || data.Lens || "",
            focalLength: data.FocalLength ? `${data.FocalLength}mm` : "",
            aperture: data.FNumber ? `f/${data.FNumber}` : "",
            shutterSpeed: formatShutterSpeed(data.ExposureTime),
            iso: data.ISO || "",
            date: data.DateTimeOriginal || data.CreateDate || null,
            title: data.ObjectName || data.title || data.Title || "",
            caption:
              data.Caption || data.description || data.Description || "",
          };
        }
      } catch {
        // No EXIF data — image still appears in gallery
      }

      const date = exif.date || fileStat.mtime;

      return {
        filename,
        src: `/photos/${filename}`,
        alt:
          exif.title ||
          exif.caption ||
          basename(filename, extname(filename)).replace(/[_-]/g, " "),
        date,
        dateFormatted: formatDate(date),
        exif,
      };
    })
  );

  photos.sort((a, b) => new Date(b.date) - new Date(a.date));

  return photos;
}

function formatCamera(make, model) {
  if (!make && !model) return "";
  if (!make) return model;
  if (!model) return make;
  if (model.toLowerCase().startsWith(make.toLowerCase())) return model;
  return `${make} ${model}`;
}

function formatShutterSpeed(exposureTime) {
  if (!exposureTime) return "";
  if (exposureTime >= 1) return `${exposureTime}s`;
  return `1/${Math.round(1 / exposureTime)}s`;
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
