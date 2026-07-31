import { resolveMedia } from "@/lib/media";

/** Paper & Loop brand asset paths — served from backend /api/uploads */
export const BRAND_ASSETS = {
  hero: "/api/uploads/hero-background.png",
  authLogin: "/api/uploads/auth-login.jpg",
  authRegister: "/api/uploads/auth-register.jpg",
  authForgot: "/api/uploads/auth-forgot.jpg",
  authAbout: "/api/uploads/auth-about.jpg",
  roomBedroom: "/api/uploads/room-bedroom.jpg",
  roomGaming: "/api/uploads/room-gaming.jpg",
  roomLiving: "/api/uploads/room-living.jpg",
  comingSoonTees: "/api/uploads/coming-soon-tees.jpg",
  comingSoonHoodies: "/api/uploads/coming-soon-hoodies.jpg",
  comingSoonAccessories: "/api/uploads/coming-soon-accessories.jpeg",
};

export const brandAsset = (key) => resolveMedia(BRAND_ASSETS[key]);

export const ROOM_TEMPLATES = [
  { name: "Bedroom", asset: "roomBedroom", zone: { top: "22%", left: "38%", width: "24%", height: "34%" } },
  { name: "Gaming setup", asset: "roomGaming", zone: { top: "18%", left: "36%", width: "28%", height: "38%" } },
  { name: "Living room", asset: "roomLiving", zone: { top: "20%", left: "40%", width: "22%", height: "32%" } },
];
