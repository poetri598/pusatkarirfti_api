import cron from "node-cron";
import { updateRoleMahasiswaToAlumni } from "../models/userModel.js";

export const startUpdateRoleCron = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ [CRON] Memulai proses update role mahasiswa -> alumni...");

    try {
      const result = await updateRoleMahasiswaToAlumni();
      if (result.affectedRows > 0) {
        console.log(`✅ [CRON] ${result.affectedRows} mahasiswa berhasil diubah menjadi alumni.`);
      } else {
        console.log("ℹ️ [CRON] Tidak ada mahasiswa yang perlu diubah.");
      }
    } catch (error) {
      console.error("❌ [CRON] Gagal update role mahasiswa ke alumni:", error.message);
    }
  });
};

// export const startUpdateRoleCron = () => {
//   cron.schedule("* * * * *", async () => {
//     console.log("⏰ Menjalankan CRON: update role mahasiswa ➝ alumni");
//     try {
//       const result = await updateRoleMahasiswaToAlumni();
//       console.log("✅ CRON selesai. Data diupdate:", result.affectedRows);
//     } catch (error) {
//       console.error("❌ Gagal menjalankan CRON:", error.message);
//     }
//   });
// };
