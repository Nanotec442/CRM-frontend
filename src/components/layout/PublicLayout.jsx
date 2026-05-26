import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <div
      className="
        min-h-screen
        bg-[#dfe6ee]
        text-[#1d2b53]
      "
    >
      <Outlet />
    </div>
  );
}

export default PublicLayout;