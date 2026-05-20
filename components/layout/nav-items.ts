import { CloudUpload, Compass, Home, User, type LucideIcon } from "lucide-react";

export const primaryNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Explore", icon: Compass },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/upload", label: "Upload", icon: CloudUpload },
];
