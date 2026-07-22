"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
import { useAuthStore } from "@/stores/authStore";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Mapeo de rutas a iconos
const iconMap: Record<string, React.ReactNode> = {
  '/dashboard/empresas': <GridIcon />,
  '/dashboard/sedes': <ListIcon />,
  '/dashboard/roles': <UserCircleIcon />,
  '/dashboard/usuarios': <UserCircleIcon />,
  '/dashboard/clientes': <UserCircleIcon />,
  '/dashboard/frutas': <GridIcon />,
  '/dashboard/variedades': <GridIcon />,
  '/dashboard/calidades': <GridIcon />,
  '/dashboard/tipos-jaba': <BoxCubeIcon />,
  '/dashboard/camiones': <BoxCubeIcon />,
  '/dashboard/lugares-operativos': <ListIcon />,
  '/dashboard/puestos': <ListIcon />,
  '/dashboard/clientes-puestos': <ListIcon />,
  '/dashboard/operaciones-carga': <TableIcon />,
  '/dashboard/operaciones-carga/nueva': <TableIcon />,
  '/dashboard/items-reparto': <BoxCubeIcon />,
  '/dashboard/guias-operativas': <BoxCubeIcon />,
  '/dashboard/entregas': <BoxCubeIcon />,
  '/dashboard/jabas': <PieChartIcon />,
  '/dashboard/incidencias': <PlugInIcon />,
  '/dashboard/evidencias': <PlugInIcon />,
  '/dashboard/logs-actividad': <PlugInIcon />,
  '/dashboard/configuracion': <PlugInIcon />,
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { hasRole, hasModulo, modulos } = useAuthStore();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Construir menú dinámicamente desde los módulos del usuario
  const { mainNavItems, othersItems } = useMemo(() => {
    // Agrupar módulos por categoría
    const categoriasMap = new Map<string, { nombre: string; orden: number; modulos: typeof modulos }>();

    for (const modulo of modulos) {
      if (!modulo.estado) continue;
      const catNombre = modulo.categoria.nombre;
      const catOrden = modulo.categoria.orden || 0;
      if (!categoriasMap.has(catNombre)) {
        categoriasMap.set(catNombre, { nombre: catNombre, orden: catOrden, modulos: [] });
      }
      categoriasMap.get(catNombre)!.modulos.push(modulo);
    }

    // Iconos por defecto para categorías
    const defaultIcons: React.ReactNode[] = [
      <GridIcon />, <ListIcon />, <TableIcon />, <BoxCubeIcon />,
      <PieChartIcon />, <PlugInIcon />, <UserCircleIcon />,
    ];

    // Construir nav items
    const navItems: NavItem[] = [
      {
        name: "Dashboard",
        icon: <GridIcon />,
        path: "/dashboard",
      },
    ];

    // Ordenar categorías por su campo 'orden' y agregar al menú
    const sortedCategorias = Array.from(categoriasMap.values())
      .sort((a, b) => a.orden - b.orden);

    sortedCategorias.forEach((cat, idx) => {
      const subItems = cat.modulos
        .sort((a, b) => (a.orden || 0) - (b.orden || 0))
        .map((m) => ({
          name: m.nombre,
          path: m.ruta,
        }));

      if (subItems.length > 0) {
        navItems.push({
          name: cat.nombre,
          icon: defaultIcons[idx % defaultIcons.length],
          subItems,
        });
      }
    });

    // Agregar configuración solo para administradores
    if (hasRole('administrador')) {
      navItems.push({
        name: "Configuración",
        icon: <PlugInIcon />,
        subItems: [
          { name: "Categorías", path: "/dashboard/configuracion/categorias" },
          { name: "Módulos", path: "/dashboard/configuracion/modulos" },
          { name: "Permisos de roles", path: "/dashboard/configuracion/permisos" },
        ],
      });
    }

    const otherItems: NavItem[] = [
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

    return { mainNavItems: navItems, othersItems: otherItems };
  }, [modulos, hasRole]);

  // Verificar si una ruta está permitida
  const isPathAllowed = (path: string) => {
    // Dashboard y rutas base siempre permitidas
    if (path === '/dashboard' || path === '/dashboard/calendar' || path === '/dashboard/profile') {
      return true;
    }
    // Verificar si el usuario tiene el módulo
    return hasModulo(path);
  };

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
          setOpenSubmenu(null);
          submenuMatched = true;
        }
      });
    };
    checkItems(mainNavItems, "main");
    checkItems(othersItems, "others");
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive, mainNavItems, othersItems]);

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

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => {
    const filteredItems = navItems.filter(item => {
      if (item.subItems) {
        return item.subItems.some(sub => isPathAllowed(sub.path));
      } else if (item.path) {
        return isPathAllowed(item.path);
      }
      return false;
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);
    if (!mounted) {
      return <aside className="fixed mt-16 ... w-[290px]" />;
    }

    return (
      <ul className="flex flex-col gap-4">
        {filteredItems.map((nav, index) => (
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
                  {nav.subItems
                    .filter(subItem => isPathAllowed(subItem.path))
                    .map((subItem) => (
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
