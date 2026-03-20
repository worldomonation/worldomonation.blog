import { readdir, stat } from "node:fs/promises";
import { join, extname, basename, relative } from "node:path";
import exifr from "exifr";

const PHOTOS_DIR = "src/photos";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tiff"]);

async function findImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findImages(fullPath)));
    } else if (IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

export default async function () {
  let imagePaths;
  try {
    imagePaths = await findImages(PHOTOS_DIR);
  } catch {
    return [];
  }

  const photos = await Promise.all(
    imagePaths.map(async (filepath) => {
      const relativePath = relative(PHOTOS_DIR, filepath);
      const filename = basename(filepath);
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
            focalLength: data.FocalLength ? `${Math.floor(data.FocalLength)}mm` : "",
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

      const date = exif.date || parseDateFromFilename(filename) || fileStat.mtime;

      return {
        filename,
        src: `/photos/${relativePath}`,
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

function parseDateFromFilename(filename) {
  const match = basename(filename, extname(filename)).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );
  if (!match) return null;
  return new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`);
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
