import { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type UserRole = Database["public"]["Enums"]["user_role"];
