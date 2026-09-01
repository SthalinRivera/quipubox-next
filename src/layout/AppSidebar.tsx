"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
} from "lucide-react";

const lucideIconMap: Record<string, React.ComponentType<any>> = {
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
        .sort((a, b) => (a.orden || 0) - (b.orden || 0))
        .map((m) => ({ name: m.nombre, path: m.ruta }));

      if (subItems.length > 0) {
        navItems.push({ name: cat.nombre, icon: getIconFromName(cat.icono_web), subItems });
      }
    });

    const otherItems: NavItem[] = [
      { icon: <Calendar />, name: "Calendar", path: "/dashboard/calendar" },
      { icon: <User />, name: "User Profile", path: "/dashboard/profile" },
    ];

    return { mainNavItems: navItems, othersItems: otherItems };
  }, [modulos, hasRole]);

  const isPathAllowed = (path: string) => {
    if (path === '/dashboard' || path === '/dashboard/calendar' || path === '/dashboard/profile') return true;
    return hasModulo(path);
  };

  useEffect(() => {
    let submenuMatched = false;
    const checkItems = (items: NavItem[], type: "main" | "others") => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) { setOpenSubmenu({ type, index }); submenuMatched = true; }
          });
        } else if (nav.path && isActive(nav.path)) { setOpenSubmenu(null); submenuMatched = true; }
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
        setSubMenuHeight((prev) => ({ ...prev, [key]: subMenuRefs.current[key]?.scrollHeight || 0 }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => prev && prev.type === menuType && prev.index === index ? null : { type: menuType, index });
  };

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => {
    const filteredItems = navItems.filter(item => {
      if (item.subItems) return item.subItems.some(sub => isPathAllowed(sub.path));
      if (item.path) return isPathAllowed(item.path);
      return false;
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return <aside className="fixed mt-16 ... w-[290px]" />;

    return (
      <ul className="flex flex-col gap-4">
        {filteredItems.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span className={`${openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`} />
                )}
              </button>
            ) : (
              nav.path && (
                <Link href={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                  <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => { subMenuRefs.current[`${menuType}-${index}`] = el; }}
                className="overflow-hidden transition-all duration-300"
                style={{ height: openSubmenu?.type === menuType && openSubmenu?.index === index ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px" }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.filter(subItem => isPathAllowed(subItem.path)).map((subItem) => (
                    <li key={subItem.name}>
                      <Link href={subItem.path} className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && <span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>new</span>}
                          {subItem.pro && <span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>pro</span>}
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
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} />
              <Image className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Principal" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(mainNavItems, "main")}
            </div>
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
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
