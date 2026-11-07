import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Masukkan email atau ID karyawan.")
    .refine(
      (value) =>
        z.email().safeParse(value.trim()).success ||
        /^[A-Za-z0-9._-]{2,32}$/.test(value.trim()),
      "Format email atau ID karyawan tidak valid."
    ),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
});

export type LoginValues = z.infer<typeof loginSchema>;
