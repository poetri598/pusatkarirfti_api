export function cleanTags(tagsString = "") {
  return tagsString
    .split(/[,\s]+/) // pisahkan dengan koma atau spasi
    .filter(Boolean) // hapus tag kosong
    .map((tag) => (tag.trim().startsWith("#") ? tag.trim() : `#${tag.trim()}`)) // pastikan setiap tag diawali dengan #
    .join(", "); // gabungkan kembali dengan koma dan spasi
}
