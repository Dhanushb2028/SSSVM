import { z } from "zod";

export const vehicleSchema = z.object({
  branchId: z.string().min(1, "Select a branch"),
  vehicleNumber: z.string().trim().min(1, "Vehicle number is required"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  driverName: z.string().trim().min(1, "Driver name is required"),
  driverPhone: z.string().trim().min(1, "Driver phone is required"),
});

export const routeStopRowSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Stop name is required"),
  pickupTime: z.string().trim().min(1, "Pickup time is required"),
  sequence: z.coerce.number().int().min(0),
});

export const saveRouteSchema = z.object({
  branchId: z.string().min(1, "Select a branch"),
  name: z.string().trim().min(1, "Route name is required"),
  vehicleId: z.string().optional(),
  monthlyFee: z.coerce.number().min(0),
  stops: z.array(routeStopRowSchema).min(1, "Add at least one stop"),
});

export const assignStudentTransportSchema = z.object({
  studentId: z.string().min(1),
  routeStopId: z.string().optional(),
});
