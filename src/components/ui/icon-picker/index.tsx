'use client';

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import {
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
  Trash2, Archive, Filter, SortAsc, SortDesc, RefreshCw, RotateCcw,
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
} from 'lucide-react';
import type { ComponentType } from 'react';

const allIcons: { name: string; icon: ComponentType<any> }[] = [
  { name: 'LayoutDashboard', icon: LayoutDashboard },
  { name: 'FolderTree', icon: FolderTree },
  { name: 'Truck', icon: Truck },
  { name: 'ClipboardList', icon: ClipboardList },
  { name: 'BarChart3', icon: BarChart3 },
  { name: 'Settings', icon: Settings },
  { name: 'Calendar', icon: Calendar },
  { name: 'User', icon: User },
  { name: 'Grid3X3', icon: Grid3X3 },
  { name: 'List', icon: List },
  { name: 'Table', icon: Table },
  { name: 'Box', icon: Box },
  { name: 'PieChart', icon: PieChart },
  { name: 'Plug', icon: Plug },
  { name: 'Pencil', icon: Pencil },
  { name: 'Power', icon: Power },
  { name: 'Play', icon: Play },
  { name: 'Plus', icon: Plus },
  { name: 'Eye', icon: Eye },
  { name: 'FileText', icon: FileText },
  { name: 'MapPin', icon: MapPin },
  { name: 'Package', icon: Package },
  { name: 'Users', icon: Users },
  { name: 'Home', icon: Home },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'ClipboardCheck', icon: ClipboardCheck },
  { name: 'AlertTriangle', icon: AlertTriangle },
  { name: 'Camera', icon: Camera },
  { name: 'Activity', icon: Activity },
  { name: 'Building2', icon: Building2 },
  { name: 'Map', icon: Map },
  { name: 'CircleDot', icon: CircleDot },
  { name: 'Hash', icon: Hash },
  { name: 'Apple', icon: Apple },
  { name: 'Cherry', icon: Cherry },
  { name: 'Grape', icon: Grape },
  { name: 'Citrus', icon: Citrus },
  { name: 'Carrot', icon: Carrot },
  { name: 'Wheat', icon: Wheat },
  { name: 'Bean', icon: Bean },
  { name: 'Egg', icon: Egg },
  { name: 'Milk', icon: Milk },
  { name: 'Fish', icon: Fish },
  { name: 'Beef', icon: Beef },
  { name: 'Sandwich', icon: Sandwich },
  { name: 'Pizza', icon: Pizza },
  { name: 'Soup', icon: Soup },
  { name: 'Salad', icon: Salad },
  { name: 'Cookie', icon: Cookie },
  { name: 'Cake', icon: Cake },
  { name: 'Candy', icon: Candy },
  { name: 'Coffee', icon: Coffee },
  { name: 'Wine', icon: Wine },
  { name: 'Beer', icon: Beer },
  { name: 'GlassWater', icon: GlassWater },
  { name: 'Baby', icon: Baby },
  { name: 'Smile', icon: Smile },
  { name: 'Frown', icon: Frown },
  { name: 'Meh', icon: Meh },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Zap', icon: Zap },
  { name: 'Sun', icon: Sun },
  { name: 'Moon', icon: Moon },
  { name: 'Cloud', icon: Cloud },
  { name: 'CloudRain', icon: CloudRain },
  { name: 'Snowflake', icon: Snowflake },
  { name: 'Wind', icon: Wind },
  { name: 'Thermometer', icon: Thermometer },
  { name: 'Droplets', icon: Droplets },
  { name: 'Flame', icon: Flame },
  { name: 'Leaf', icon: Leaf },
  { name: 'TreePine', icon: TreePine },
  { name: 'Flower2', icon: Flower2 },
  { name: 'Bug', icon: Bug },
  { name: 'Bird', icon: Bird },
  { name: 'Cat', icon: Cat },
  { name: 'Dog', icon: Dog },
  { name: 'Rabbit', icon: Rabbit },
  { name: 'Turtle', icon: Turtle },
  { name: 'Anchor', icon: Anchor },
  { name: 'Compass', icon: Compass },
  { name: 'Navigation', icon: Navigation },
  { name: 'Globe', icon: Globe },
  { name: 'Radio', icon: Radio },
  { name: 'Wifi', icon: Wifi },
  { name: 'Bluetooth', icon: Bluetooth },
  { name: 'Signal', icon: Signal },
  { name: 'Vibrate', icon: Vibrate },
  { name: 'Volume2', icon: Volume2 },
  { name: 'Music', icon: Music },
  { name: 'Mic', icon: Mic },
  { name: 'Headphones', icon: Headphones },
  { name: 'Speaker', icon: Speaker },
  { name: 'Video', icon: Video },
  { name: 'Film', icon: Film },
  { name: 'Tv', icon: Tv },
  { name: 'Monitor', icon: Monitor },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Tablet', icon: Tablet },
  { name: 'Laptop', icon: Laptop },
  { name: 'Keyboard', icon: Keyboard },
  { name: 'Mouse', icon: Mouse },
  { name: 'Printer', icon: Printer },
  { name: 'ScanLine', icon: ScanLine },
  { name: 'QrCode', icon: QrCode },
  { name: 'Link2', icon: Link2 },
  { name: 'Unlink', icon: Unlink },
  { name: 'Paperclip', icon: Paperclip },
  { name: 'Mail', icon: Mail },
  { name: 'Inbox', icon: Inbox },
  { name: 'Send', icon: Send },
  { name: 'Reply', icon: Reply },
  { name: 'Forward', icon: Forward },
  { name: 'Trash2', icon: Trash2 },
  { name: 'Archive', icon: Archive },
  { name: 'Search', icon: Search },
  { name: 'Filter', icon: Filter },
  { name: 'SortAsc', icon: SortAsc },
  { name: 'SortDesc', icon: SortDesc },
  { name: 'RefreshCw', icon: RefreshCw },
  { name: 'RotateCcw', icon: RotateCcw },
  { name: 'Repeat', icon: Repeat },
  { name: 'Shuffle', icon: Shuffle },
  { name: 'SkipForward', icon: SkipForward },
  { name: 'SkipBack', icon: SkipBack },
  { name: 'PlayCircle', icon: PlayCircle },
  { name: 'PauseCircle', icon: PauseCircle },
  { name: 'StopCircle', icon: StopCircle },
  { name: 'FastForward', icon: FastForward },
  { name: 'Rewind', icon: Rewind },
  { name: 'VolumeX', icon: VolumeX },
  { name: 'Volume1', icon: Volume1 },
  { name: 'Maximize', icon: Maximize },
  { name: 'Minimize', icon: Minimize },
  { name: 'ZoomIn', icon: ZoomIn },
  { name: 'ZoomOut', icon: ZoomOut },
  { name: 'Move', icon: Move },
  { name: 'GripVertical', icon: GripVertical },
  { name: 'GripHorizontal', icon: GripHorizontal },
  { name: 'AlignLeft', icon: AlignLeft },
  { name: 'AlignCenter', icon: AlignCenter },
  { name: 'AlignRight', icon: AlignRight },
  { name: 'AlignJustify', icon: AlignJustify },
  { name: 'Bold', icon: Bold },
  { name: 'Italic', icon: Italic },
  { name: 'Underline', icon: Underline },
  { name: 'Strikethrough', icon: Strikethrough },
  { name: 'Code', icon: Code },
  { name: 'Terminal', icon: Terminal },
  { name: 'FileCode', icon: FileCode },
  { name: 'Folder', icon: Folder },
  { name: 'FolderOpen', icon: FolderOpen },
  { name: 'FolderPlus', icon: FolderPlus },
  { name: 'FolderMinus', icon: FolderMinus },
  { name: 'File', icon: File },
  { name: 'FilePlus', icon: FilePlus },
  { name: 'FileMinus', icon: FileMinus },
  { name: 'FileEdit', icon: FileEdit },
  { name: 'FileSearch', icon: FileSearch },
  { name: 'Save', icon: Save },
  { name: 'Download', icon: Download },
  { name: 'Upload', icon: Upload },
  { name: 'Share', icon: Share },
  { name: 'Share2', icon: Share2 },
  { name: 'ExternalLink', icon: ExternalLink },
  { name: 'Lock', icon: Lock },
  { name: 'Unlock', icon: Unlock },
  { name: 'Shield', icon: Shield },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'ShieldAlert', icon: ShieldAlert },
  { name: 'Key', icon: Key },
  { name: 'EyeOff', icon: EyeOff },
  { name: 'Fingerprint', icon: Fingerprint },
  { name: 'Tag', icon: Tag },
  { name: 'Tags', icon: Tags },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'BookmarkPlus', icon: BookmarkPlus },
  { name: 'BookmarkMinus', icon: BookmarkMinus },
  { name: 'Flag', icon: Flag },
  { name: 'Bell', icon: Bell },
  { name: 'BellOff', icon: BellOff },
  { name: 'BellRing', icon: BellRing },
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Phone', icon: Phone },
  { name: 'PhoneCall', icon: PhoneCall },
  { name: 'PhoneOff', icon: PhoneOff },
  { name: 'PhoneIncoming', icon: PhoneIncoming },
  { name: 'PhoneOutgoing', icon: PhoneOutgoing },
  { name: 'Voicemail', icon: Voicemail },
  { name: 'Percent', icon: Percent },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Wallet', icon: Wallet },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'Receipt', icon: Receipt },
  { name: 'Banknote', icon: Banknote },
  { name: 'Coins', icon: Coins },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'TrendingDown', icon: TrendingDown },
  { name: 'BarChart2', icon: BarChart2 },
  { name: 'LineChart', icon: LineChart },
  { name: 'Target', icon: Target },
  { name: 'Award', icon: Award },
  { name: 'Trophy', icon: Trophy },
  { name: 'Medal', icon: Medal },
  { name: 'Crown', icon: Crown },
  { name: 'Gem', icon: Gem },
  { name: 'Diamond', icon: Diamond },
  { name: 'Circle', icon: Circle },
  { name: 'Square', icon: Square },
  { name: 'Triangle', icon: Triangle },
  { name: 'Hexagon', icon: Hexagon },
  { name: 'Octagon', icon: Octagon },
  { name: 'Pentagon', icon: Pentagon },
  { name: 'ThumbsUp', icon: ThumbsUp },
  { name: 'ThumbsDown', icon: ThumbsDown },
  { name: 'Hand', icon: Hand },
  { name: 'Pointer', icon: Pointer },
  { name: 'MousePointer', icon: MousePointer },
  { name: 'Crosshair', icon: Crosshair },
  { name: 'Focus', icon: Focus },
  { name: 'Type', icon: Type },
  { name: 'Indent', icon: Indent },
  { name: 'Outdent', icon: Outdent },
  { name: 'ListOrdered', icon: ListOrdered },
  { name: 'ListChecks', icon: ListChecks },
  { name: 'Quote', icon: Quote },
  { name: 'Scissors', icon: Scissors },
  { name: 'Clipboard', icon: Clipboard },
  { name: 'ClipboardPaste', icon: ClipboardPaste },
  { name: 'ClipboardCopy', icon: ClipboardCopy },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Book', icon: Book },
  { name: 'BookMarked', icon: BookMarked },
  { name: 'Library', icon: Library },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'School', icon: School },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Building', icon: Building },
  { name: 'Factory', icon: Factory },
  { name: 'Warehouse', icon: Warehouse },
  { name: 'Store', icon: Store },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Clock', icon: Clock },
  { name: 'Timer', icon: Timer },
  { name: 'Hourglass', icon: Hourglass },
  { name: 'CalendarDays', icon: CalendarDays },
  { name: 'CalendarCheck', icon: CalendarCheck },
  { name: 'CalendarX', icon: CalendarX },
  { name: 'CalendarPlus', icon: CalendarPlus },
  { name: 'CalendarMinus', icon: CalendarMinus },
  { name: 'IceCreamBowl', icon: IceCreamBowl },
  { name: 'TruckIcon', icon: TruckIcon },
  { name: 'PackageCheck', icon: PackageCheck },
];

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
  label?: string;
}

export default function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return allIcons;
    const q = search.toLowerCase();
    return allIcons.filter((i) => i.name.toLowerCase().includes(q));
  }, [search]);

  const SelectedIcon = allIcons.find((i) => i.name === value)?.icon;

  return (
    <div className="relative">
      {label && <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 hover:border-blue-400 transition-colors"
      >
        {SelectedIcon ? (
          <>
            <SelectedIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{value}</span>
          </>
        ) : (
          <span className="text-gray-400">Seleccionar icono...</span>
        )}
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="ml-auto shrink-0 rounded p-0.5 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900">
          <div className="sticky top-0 border-b border-gray-100 bg-white p-2 dark:border-white/10 dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar icono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="h-8 w-full rounded-md border border-gray-200 bg-gray-50 pl-8 pr-2 text-xs text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              />
            </div>
          </div>

          <div className="max-h-[240px] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-gray-400">No se encontraron iconos</p>
            ) : (
              <div className="grid grid-cols-6 gap-1">
                {filtered.map((item) => {
                  const IconComp = item.icon;
                  const isActive = value === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      title={item.name}
                      onClick={() => { onChange(item.name); setOpen(false); setSearch(''); }}
                      className={`group flex flex-col items-center gap-1 rounded-md p-1.5 text-[10px] transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200'
                      }`}
                    >
                      <IconComp className="h-4 w-4 shrink-0" />
                      <span className="w-full truncate text-center leading-tight">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 p-1.5 dark:border-white/10">
            <button
              type="button"
              onClick={() => { setOpen(false); setSearch(''); }}
              className="w-full rounded-md py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
