import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useThemeStore from "../store/themeStore";
import useUserStore from "../store/useUserStore";
import useLayOutStore from "../store/layoutStore";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme, setTheme } = useThemeStore();
  const { user } = useUserStore();
  const { activeTab, setActiveTab, selectedContact } = useLayOutStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("chats");
    } else if (location.pathname === "status") {
      setActiveTab("status");
    } else if (location.pathname === "/user-profile") {
      setActiveTab("profile");
    } else if (location.pathname === "/setting") {
      setActiveTab("setting");
    }
  }, [location, setActiveTab]);

  if (isMobile && selectedContact) {
    return null;
  }

  const SidebarContent = (
    <>
      <Link
        to="/"
        className={`${isMobile ? "" : "mb-8"} ${
          activeTab === "chats" && "bg-gray-300 shadow-sm p-2 rounded-full"
        } focus:outline-none`}
      >
        <FaWhatsapp
          className={`h-6 w-6 ${
            activeTab === "chats"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-800"
          }`}
        />
      </Link>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${
        isMobile
          ? "fixed bottom-0 left-0 right-0 h-16 border-t-2"
          : "w-16 h-screen border-r-2"
      }
      ${
        theme === "dark"
          ? "bg-gray-800 border-gray-600"
          : "bg-[rgb(239,242,254)] border-gray-300"
      }
      bg-opacity-90 flex items-center py-4 shadow-lg
      ${isMobile ? 'flex-row justify-around' : 'flex-col justify-between'}
      `}
    >
      {SidebarContent}
    </motion.div>
  );
};

export default Sidebar;
