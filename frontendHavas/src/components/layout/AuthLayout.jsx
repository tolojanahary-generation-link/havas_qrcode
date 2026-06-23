import { Outlet } from "react-router-dom";
import AuthIllustration from "@/components/auth/AuthIllustration";

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Partie gauche */}
      <AuthIllustration />

      {/* Partie formulaire */}
      <div
        className="
        flex 
        items-center 
        justify-center 
        bg-background
        px-10
      "
      >
        <Outlet />
      </div>
    </div>
  );
}
