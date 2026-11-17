"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon, HorizontaLDots } from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard, FolderTree, Truck, ClipboardList, BarChart3, Settings,
  Calendar, User, Grid3X3, List, Table, Box, PieChart, Plug, Pencil,
  Power, Play, Plus, Eye, FileText, MapPin, Package, Users, Home,
  ShoppingCart, ClipboardCheck, AlertTriangle, Camera, Activity, Building2,
  Map, CircleDot, Hash, Apple, Cherry, Grape, Citrus, Carrot, Wheat, Bean,
  Egg, Milk, Fish, Beef, Sandwich, Pizza, Soup, Salad, Cookie,
  Cake, Candy, Coffee, Wine, Beer, GlassWater, Baby, Smile, Frown,
  Meh, Heart, Star, Zap, Sun, Moon, Cloud, CloudRain, Snowflake, Wind,
  Thermometer, Droplets, Flame, Leaf, TreePine, Flower2, Bug, Bird, Cat,
  Dog, Rabbit, Turtle, Anchor, Compass, Navigation, Globe, Radio, Wifi,
  Bluetooth, Signal, Vibrate, Volume2, Music, Mic, Headphones, Speaker,
  Video, Film, Tv, Monitor, Smartphone, Tablet, Laptop, Keyboard,
  Mouse, Printer, ScanLine, QrCode, Link2, Unlink, Paperclip, Mail, Inbox,
  Send, Reply, Forward, Trash2, Archive, Search, Filter, SortAsc, SortDesc,
  RefreshCw, RotateCcw, Repeat, Shuffle, SkipForward, SkipBack, PlayCircle,
  PauseCircle, StopCircle, FastForward, Rewind, VolumeX, Volume1,
  Maximize, Minimize, ZoomIn, ZoomOut, Move, GripVertical, GripHorizontal,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline,
  Strikethrough, Code, Terminal, FileCode, Folder, FolderOpen, FolderPlus,
  FolderMinus, File, FilePlus, FileMinus, FileEdit, FileSearch, Save,
  Download, Upload, Share, Share2, ExternalLink, Lock, Unlock, Shield,
  ShieldCheck, ShieldAlert, Key, EyeOff, Fingerprint, Tag, Tags, Bookmark,
  BookmarkPlus, BookmarkMinus, Flag, Bell, BellOff, BellRing,
  MessageCircle, MessageSquare, Phone, PhoneCall,
  PhoneOff, PhoneIncoming, PhoneOutgoing, Voicemail, Percent, DollarSign,
  CreditCard, Wallet, PiggyBank, Receipt, Banknote, Coins, TrendingUp,
  TrendingDown, BarChart2, LineChart, Target, Award, Trophy, Medal, Crown,
  Gem, Diamond, Circle, Square, Triangle, Hexagon, Octagon, Pentagon,
  ThumbsUp, ThumbsDown, Hand, Pointer, MousePointer, Crosshair, Focus, Type,
  Indent, Outdent, ListOrdered, ListChecks, Quote, Scissors, Clipboard,
  ClipboardPaste, ClipboardCopy, BookOpen, Book, BookMarked, Library,
  GraduationCap, School, Briefcase, Building, Factory, Warehouse, Store,
  ShoppingBag, Clock, Timer, Hourglass,
  CalendarDays, CalendarCheck, CalendarX, CalendarPlus, CalendarMinus,
  IceCreamBowl, TruckIcon, PackageCheck,
  type LucideIcon,
} from "lucide-react";

const lucideIconMap: Record<string, LucideIcon> = {
  LayoutDashboard, FolderTree, Truck, ClipboardList, BarChart3, Settings,
  Calendar, User, Grid3X3, List, Table, Box, PieChart, Plug, Pencil, Power,
  Play, Plus, Eye, FileText, MapPin, Package, Users, Home, ShoppingCart,
  ClipboardCheck, AlertTriangle, Camera, Activity, Building2, Map, CircleDot,
  Hash, Apple, Cherry, Grape, Citrus, Carrot, Wheat, Bean, Egg, Milk, Fish,
  Beef, Sandwich, Pizza, Soup, Salad, Cookie, Cake, Candy, Coffee,
  Wine, Beer, GlassWater, Baby, Smile, Frown, Meh, Heart, Star, Zap,
  Sun, Moon, Cloud, CloudRain, Snowflake, Wind, Thermometer, Droplets, Flame,
  Leaf, TreePine, Flower2, Bug, Bird, Cat, Dog, Rabbit, Turtle, Anchor,
  Compass, Navigation, Globe, Radio, Wifi, Bluetooth, Signal, Vibrate,
  Volume2, Music, Mic, Headphones, Speaker, Video, Film, Tv, Monitor,
  Smartphone, Tablet, Laptop, Keyboard, Mouse, Printer, ScanLine,
  QrCode, Link2, Unlink, Paperclip, Mail, Inbox, Send, Reply, Forward,
  Trash2, Archive, Search, Filter, SortAsc, SortDesc, RefreshCw, RotateCcw,
  Repeat, Shuffle, SkipForward, SkipBack, PlayCircle, PauseCircle, StopCircle,
  FastForward, Rewind, VolumeX, Volume1, Maximize, Minimize, ZoomIn,
  ZoomOut, Move, GripVertical, GripHorizontal, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Bold, Italic, Underline, Strikethrough, Code,
  Terminal, FileCode, Folder, FolderOpen, FolderPlus, FolderMinus, File,
  FilePlus, FileMinus, FileEdit, FileSearch, Save, Download, Upload, Share,
  Share2, ExternalLink, Lock, Unlock, Shield, ShieldCheck, ShieldAlert, Key,
  EyeOff, Fingerprint, Tag, Tags, Bookmark, BookmarkPlus, BookmarkMinus,
  Flag, Bell, BellOff, BellRing, MessageCircle, MessageSquare,
  Phone, PhoneCall, PhoneOff, PhoneIncoming,
  PhoneOutgoing, Voicemail, Percent, DollarSign, CreditCard, Wallet,
  PiggyBank, Receipt, Banknote, Coins, TrendingUp, TrendingDown, BarChart2,
  LineChart, Target, Award, Trophy, Medal, Crown, Gem, Diamond, Circle,
  Square, Triangle, Hexagon, Octagon, Pentagon, ThumbsUp, ThumbsDown, Hand,
  Pointer, MousePointer, Crosshair, Focus, Type, Indent, Outdent, ListOrdered,
  ListChecks, Quote, Scissors, Clipboard, ClipboardPaste, ClipboardCopy,
  BookOpen, Book, BookMarked, Library, GraduationCap, School, Briefcase,
  Building, Factory, Warehouse, Store, ShoppingBag, Clock,
  Timer, Hourglass, CalendarDays, CalendarCheck, CalendarX,
  CalendarPlus, CalendarMinus, IceCreamBowl, TruckIcon, PackageCheck,
};

const DefaultIcon = Grid3X3;
const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const getIconFromName = (iconName: string | null | undefined): React.ReactNode => {
  if (!iconName) return <DefaultIcon />;
  const IconComponent = lucideIconMap[iconName];
  if (IconComponent) return <IconComponent />;
  return <DefaultIcon />;
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const { hasModulo, modulos } = useAuthStore();

  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot,
  );

  const [submenuSelection, setSubmenuSelection] = useState<{
    pathname: string;
    open: {
      type: "main" | "others";
      index: number;
    } | null;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname || (path !== '/dashboard' && pathname.startsWith(path + '/')), [pathname]);

  const { mainNavItems, othersItems } = useMemo(() => {
    const categoriasMap = new globalThis.Map<string, {
      nombre: string;
      orden: number;
      icono_web: string | null;
      modulos: typeof modulos;
    }>();

    for (const modulo of modulos) {
      if (!modulo.estado) continue;
      const catNombre = modulo.categoria.nombre;
      const catOrden = modulo.categoria.orden || 0;
      const catIcono = modulo.categoria.icono_web;
      if (!categoriasMap.has(catNombre)) {
        categoriasMap.set(catNombre, { nombre: catNombre, orden: catOrden, icono_web: catIcono ?? null, modulos: [] });
      }
      categoriasMap.get(catNombre)!.modulos.push(modulo);
    }

    const navItems: NavItem[] = [
      { name: "Dashboard", icon: <LayoutDashboard />, path: "/dashboard" },
    ];

    const sortedCategorias = Array.from(categoriasMap.values())
      .sort((a, b) => a.orden - b.orden);

    sortedCategorias.forEach((cat) => {
      const subItems = cat.modulos
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        .map((modulo) => ({ name: modulo.nombre, path: modulo.ruta }));

      if (subItems.length > 0) {
        navItems.push({ name: cat.nombre, icon: getIconFromName(cat.icono_web), subItems });
      }
    });

    const otherItems: NavItem[] = [
      { icon: <Calendar />, name: "Calendar", path: "/dashboard/calendar" },
      { icon: <User />, name: "User Profile", path: "/dashboard/profile" },
    ];

    return { mainNavItems: navItems, othersItems: otherItems };
  }, [modulos]);

  const activeSubmenu = useMemo(() => {
    const findActive = (items: NavItem[], type: "main" | "others") => {
      const index = items.findIndex((item) =>
        item.subItems?.some((subItem) => isActive(subItem.path)),
      );
      return index < 0 ? null : { type, index };
    };

    return findActive(mainNavItems, "main") ?? findActive(othersItems, "others");
  }, [isActive, mainNavItems, othersItems]);
  const openSubmenu =
    submenuSelection?.pathname === pathname
      ? submenuSelection.open
      : activeSubmenu;
  const showLabels = isExpanded || isHovered || isMobileOpen;
  const closeMobileSidebar = () => {
    if (isMobileOpen) toggleMobileSidebar();
  };

  const isPathAllowed = (path: string) => {
    if (path === '/dashboard' || path === '/dashboard/calendar' || path === '/dashboard/profile') return true;
    return hasModulo(path);
  };

  useEffect(() => {
    if (showLabels && openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({ ...prev, [key]: subMenuRefs.current[key]?.scrollHeight || 0 }));
      }
    }
  }, [openSubmenu, showLabels]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setSubmenuSelection({
      pathname,
      open:
        openSubmenu?.type === menuType && openSubmenu.index === index
          ? null
          : { type: menuType, index },
    });
  };

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => {
    const filteredItems = navItems
      .map((nav, index) => ({
        nav,
        index,
        visibleSubItems: nav.subItems?.filter((subItem) => isPathAllowed(subItem.path)),
      }))
      .filter(({ nav, visibleSubItems }) =>
        nav.subItems
          ? Boolean(visibleSubItems?.length)
          : Boolean(nav.path && isPathAllowed(nav.path)),
      );

    if (!mounted) {
      return (
        <ul className="flex flex-col gap-2 px-1" aria-hidden="true">
          {[1, 2, 3].map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              <span className="h-9 w-9 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.06]" />
              <span className="h-3 w-24 animate-pulse rounded bg-gray-100 dark:bg-white/[0.06]" />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul className="flex flex-col gap-1 px-1">
        {filteredItems.map(({ nav, index, visibleSubItems }) => (
          <li key={nav.name}>
            {nav.subItems ? (
              (() => {
                const isOpen = openSubmenu?.type === menuType && openSubmenu.index === index;
                const hasActiveChild = visibleSubItems?.some((item) => isActive(item.path)) ?? false;
                const submenuId = `${menuType}-submenu-${index}`;

                return (
                  <button
                    type="button"
                    onClick={() => handleSubmenuToggle(index, menuType)}
                    aria-expanded={isOpen}
                    aria-controls={submenuId}
                    title={showLabels ? undefined : nav.name}
                    className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${
                      hasActiveChild || isOpen
                        ? "bg-brand-50/80 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    } ${showLabels ? "" : "lg:justify-center"}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        hasActiveChild || isOpen
                          ? "bg-white text-brand-600 shadow-sm dark:bg-white/[0.08] dark:text-brand-300"
                          : "bg-gray-100/80 text-gray-500 group-hover:text-gray-700 dark:bg-white/[0.04] dark:text-gray-400 dark:group-hover:text-gray-200"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {showLabels && (
                      <>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                          {nav.name}
                        </span>
                        <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-gray-500 dark:bg-white/[0.06] dark:text-gray-400">
                          {visibleSubItems?.length ?? 0}
                        </span>
                        <ChevronDownIcon
                          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-brand-500 dark:text-brand-300" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
                );
              })()
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  onClick={closeMobileSidebar}
                  title={showLabels ? undefined : nav.name}
                  aria-current={isActive(nav.path) ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${
                    isActive(nav.path)
                      ? "bg-brand-50/80 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  } ${showLabels ? "" : "lg:justify-center"}`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isActive(nav.path)
                        ? "bg-white text-brand-600 shadow-sm dark:bg-white/[0.08] dark:text-brand-300"
                        : "bg-gray-100/80 text-gray-500 group-hover:text-gray-700 dark:bg-white/[0.04] dark:text-gray-400 dark:group-hover:text-gray-200"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {showLabels && <span className="truncate text-[13px] font-semibold">{nav.name}</span>}
                </Link>
              )
            )}
            {nav.subItems && showLabels && (
              <div
                id={`${menuType}-submenu-${index}`}
                ref={(el) => { subMenuRefs.current[`${menuType}-${index}`] = el; }}
                className="overflow-hidden transition-[height] duration-200 ease-out"
                style={{ height: openSubmenu?.type === menuType && openSubmenu?.index === index ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px" }}
              >
                <ul className="ml-[2.85rem] mt-2 space-y-1 py-1">
                  {visibleSubItems?.map((subItem) => (
                    <li key={subItem.path}>
                      <Link
                        href={subItem.path}
                        onClick={closeMobileSidebar}
                        aria-current={isActive(subItem.path) ? "page" : undefined}
                        className={`group flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${
                          isActive(subItem.path)
                            ? "bg-white font-semibold text-brand-700 shadow-sm dark:bg-white/[0.06] dark:text-brand-300"
                            : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-100"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            isActive(subItem.path)
                              ? "bg-brand-500 ring-2 ring-brand-100 dark:ring-brand-500/20"
                              : "bg-gray-300 group-hover:bg-gray-500 dark:bg-gray-600 dark:group-hover:bg-gray-300"
                          }`}
                        />
                        <span className="min-w-0 flex-1 truncate">{subItem.name}</span>
                        {subItem.new && <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">Nuevo</span>}
                        {subItem.pro && <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">Pro</span>}
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
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white/95 px-3 text-gray-900 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.3)] backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-950/95 lg:mt-0
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex min-h-[76px] items-center border-b border-gray-100 px-1 dark:border-white/[0.06] ${!isExpanded && !isHovered && !isMobileOpen ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-xl p-1.5 transition hover:bg-gray-50 dark:hover:bg-white/[0.04]">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image className="dark:hidden" src="/images/logo/logo.svg" alt="Quipubox" width={132} height={36} priority />
              <Image className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Quipubox" width={132} height={36} priority />
            </>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Quipubox" width={34} height={34} priority />
          )}
        </Link>
      </div>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto py-5">
        <nav className="flex-1">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className={`mb-2 flex items-center px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 ${!isExpanded && !isHovered && !isMobileOpen ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menú" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(mainNavItems, "main")}
            </div>
            <div>
              <h2 className={`mb-2 flex items-center px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 ${!isExpanded && !isHovered && !isMobileOpen ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Atajos" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? (
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/[0.06]">
            <SidebarWidget />
          </div>
        ) : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
