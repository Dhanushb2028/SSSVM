import { z } from "zod";

export const galleryAlbumSchema = z.object({
  branchId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
});

export const videoSchema = z.object({
  branchId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
  videoUrl: z.url("Enter a valid video URL"),
  description: z.string().trim().optional().or(z.literal("")),
});
