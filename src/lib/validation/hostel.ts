import { z } from "zod";

export const hostelSchema = z.object({
  branchId: z.string().min(1, "Select a branch"),
  name: z.string().trim().min(1, "Name is required"),
  wardenId: z.string().optional(),
});

export const hostelRoomSchema = z.object({
  hostelId: z.string().min(1),
  roomNumber: z.string().trim().min(1, "Room number is required"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
});

export const assignHostelRoomSchema = z.object({
  studentId: z.string().min(1),
  hostelRoomId: z.string().optional(),
});
