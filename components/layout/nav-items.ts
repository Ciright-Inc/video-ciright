import { Compass, History, Home, Layers, User, type LucideIcon } from "lucide-react";

export const primaryNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Explore", icon: Compass },
  { href: "/profile/history", label: "History", icon: History },
  { href: "/subscriptions", label: "Subscriptions", icon: Layers },
  { href: "/profile", label: "Profile", icon: User },
];
