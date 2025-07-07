export function generateSlug(text = "") {
  return (
    text
      .toString()
      .trim()
      .toLowerCase()
      // buang karakter non‑alphanumeric kecuali spasi & tanda hubung
      .replace(/[^\w\s-]/g, "")
      // ganti spasi/tanda underscore menjadi tanda hubung
      .replace(/[\s_]+/g, "-")
      // hilangkan tanda hubung dobel
      .replace(/-+/g, "-")
  );
}
