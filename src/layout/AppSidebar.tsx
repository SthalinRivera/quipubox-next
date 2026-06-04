"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

// Definición de tipos
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// ============================================================
// MÓDULOS PRINCIPALES ORGANIZADOS POR FASES
// ============================================================
const fase1: NavItem = {
  name: "Base del sistema",
  icon: <GridIcon />,
  subItems: [
    { name: "Empresas", path: "/dashboard/empresas" },
    { name: "Sedes", path: "/dashboard/sedes" },
    { name: "Roles de usuarios", path: "/dashboard/roles" },
    { name: "Usuarios", path: "/dashboard/usuarios" },
    { name: "Clientes", path: "/dashboard/clientes" },
    { name: "Frutas", path: "/dashboard/frutas" },
    { name: "Variedades", path: "/dashboard/variedades" },
    { name: "Calidades", path: "/dashboard/calidades" },
    { name: "Tipos de jaba", path: "/dashboard/tipos-jaba" },
    { name: "Camiones", path: "/dashboard/camiones" },
  ],
};

const fase2: NavItem = {
  name: "Ubicaciones",
  icon: <ListIcon />,
  subItems: [
    { name: "Mercados", path: "/dashboard/mercados" },
    { name: "Puestos", path: "/dashboard/puestos" },
    { name: "Cliente-sede", path: "/dashboard/cliente-sede" },
  ],
};

const fase3: NavItem = {
  name: "Operación principal",
  icon: <TableIcon />,
  subItems: [
    { name: "Operaciones de carga", path: "/dashboard/operaciones-carga" },
    { name: "Detalle por calidades", path: "/dashboard/detalle-calidades" },
  ],
};

const fase4: NavItem = {
  name: "Reparto y entrega",
  icon: <BoxCubeIcon />,
  subItems: [
    { name: "Items de reparto", path: "/dashboard/items-reparto" },
    { name: "Guías operativas", path: "/dashboard/guias-operativas" },
    // { name: "Detalle de guías", path: "/dashboard/detalle-guias" },
    { name: "Entregas", path: "/dashboard/entregas" },
  ],
};

const fase5: NavItem = {
  name: "Jabas",
  icon: <PieChartIcon />,
  subItems: [
    { name: "Jabas por cobrar", path: "/dashboard/jabas-cobrar" },
    { name: "Recuperaciones de jabas", path: "/dashboard/recuperaciones-jabas" },
    { name: "Jabas por pagar", path: "/dashboard/jabas-pagar" },
    { name: "Devoluciones al emisor", path: "/dashboard/devoluciones-emisor" },
  ],
};

const fase6: NavItem = {
  name: "Control",
  icon: <PlugInIcon />,
  subItems: [
    { name: "Incidencias", path: "/dashboard/incidencias" },
    { name: "Evidencias", path: "/dashboard/evidencias" },
    { name: "Logs de actividad", path: "/dashboard/logs" },
  ],
};

// Array principal del menú (puedes añadir Dashboard al inicio si lo deseas)
const mainNavItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <GridIcon />,
    path: "/dashboard",
  },
  fase1,
  fase2,
  fase3,
  fase4,
  fase5,
  fase6,
];

// Si quieres mantener una sección "Others" con cosas adicionales (Calendar, Profile, etc.)
const othersItems: NavItem[] = [
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/dashboard/calendar",
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/dashboard/profile",
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Abrir automáticamente el submenú si la ruta actual coincide con algún subItem
  useEffect(() => {
    let submenuMatched = false;
    const checkItems = (items: NavItem[], type: "main" | "others") => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type, index });
              submenuMatched = true;
            }
          });
        } else if (nav.path && isActive(nav.path)) {
          // Si es un item sin submenu y está activo, cerramos cualquier submenu abierto
          setOpenSubmenu(null);
          submenuMatched = true;
        }
      });
    };
    checkItems(mainNavItems, "main");
    checkItems(othersItems, "others");
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index ? null : { type: menuType, index }
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Principal" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(mainNavItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Otros" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;