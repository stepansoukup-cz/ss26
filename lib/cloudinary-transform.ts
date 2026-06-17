/** Cloudinary transformace v URL — bez druhého uploadu. */

export function cloudinaryTransformUrl(
  url: string,
  transformation: string,
): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", `/upload/${transformation}/`);
}

export function cloudinaryGalleryThumbUrl(url: string, width = 400) {
  return cloudinaryTransformUrl(
    url,
    `w_${width},c_fill,f_auto,q_auto`,
  );
}

export function cloudinaryGalleryDisplayUrl(url: string, width = 1600) {
  return cloudinaryTransformUrl(
    url,
    `w_${width},c_limit,f_auto,q_auto`,
  );
}
