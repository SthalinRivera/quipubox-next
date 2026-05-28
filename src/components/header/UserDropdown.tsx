"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User, Settings, LifeBuoy, LogOut } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const isLoading = authLoading || profileLoading;

  // Datos del usuario logueado (solo si no está cargando)
  const userName = profile?.nombres
    ? `${profile.nombres} ${profile.apellidos || ""}`
    : user?.email || "Usuario";
  const userEmail = user?.email || "usuario@ejemplo.com";
  const userAvatar = profile?.avatar_url || "/images/user/default-avatar.jpg";

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        {isLoading ? (
          // Skeleton para avatar y nombre mientras carga
          <>
            <span className="mr-3 overflow-hidden rounded-full h-11 w-11 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <span className="block mr-1 font-medium text-theme-sm w-20 h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          </>
        ) : (
          <>
            <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
              <Image
                width={44}
                height={44}
                src={userAvatar}
                alt={userName}
                className="object-cover"
              />
            </span>
            <span className="block mr-1 font-medium text-theme-sm truncate max-w-[100px]">
              {userName}
            </span>
          </>
        )}
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        {isLoading ? (
          // Skeleton dentro del dropdown mientras carga
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div>
              <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                {userName}
              </span>
              <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                {userEmail}
              </span>
            </div>
            <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
              <li>
                <DropdownItem
                  onItemClick={closeDropdown}
                  tag="a"
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <User className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
                  Editar perfil
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onItemClick={closeDropdown}
                  tag="a"
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <Settings className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
                  Configuración de cuenta
                </DropdownItem>
              </li>
              <li>
                <DropdownItem
                  onItemClick={closeDropdown}
                  tag="a"
                  href="/support"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <LifeBuoy className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
                  Soporte
                </DropdownItem>
              </li>
            </ul>
          </>
        )}
        <button
          onClick={() => {
            handleLogout();
            closeDropdown();
          }}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
        >
          <LogOut className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
          Cerrar sesión
        </button>
      </Dropdown>
    </div>
  );
}