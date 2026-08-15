'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { useCategorias } from '@/hooks/useCategorias';
import { useToast } from '@/hooks/useToast';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import IconPicker from '@/components/ui/icon-picker';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { ComponentType } from 'react';
import type { Categoria } from '@/types/configuracion';
import {
  LayoutDashboard, FolderTree, Truck, ClipboardList, BarChart3, Settings,
  Calendar, User, Grid3X3, List, Table, Box, PieChart, Plug, Pencil as PencilIcon, Power,
  Play, Eye, FileText, MapPin, Package, Users, Home, ShoppingCart,
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
  Archive, Filter, SortAsc, SortDesc, RefreshCw, RotateCcw,
  Repeat, Shuffle, SkipForward, SkipBack, PlayCircle, PauseCircle, StopCircle,
  FastForward, Rewind, VolumeX, Volume1, Maximize, Minimize, ZoomIn,
  ZoomOut, Move, GripHorizontal, AlignLeft, AlignCenter,
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

const iconMap: Record<string, ComponentType<any>> = {
  LayoutDashboard, FolderTree, Truck, ClipboardList, BarChart3, Settings,
  Calendar, User, Grid3X3, List, Table, Box, PieChart, Plug, Pencil: PencilIcon, Power,
  Play, Eye, FileText, MapPin, Package, Users, Home, ShoppingCart,
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
};

const getIcon = (name: string | null | undefined) => {
  if (!name) return null;
  return iconMap[name] || null;
};

const schema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    descripcion: z.string().optional(),
    icono_web: z.string().optional(),
    icono_mobil: z.string().optional(),
    orden: z.coerce.number().default(0),
    estado: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const ItemTypes = { ROW: 'row' };

interface DragRowProps {
    index: number;
    moveRow: (dragIndex: number, hoverIndex: number) => void;
    onDrop: () => void;
    children: React.ReactNode;
}

function DragRow({ index, moveRow, onDrop, children }: DragRowProps) {
    const ref = useRef<HTMLTableRowElement>(null);
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.ROW,
        item: () => ({ index }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    const [, drop] = useDrop({
        accept: ItemTypes.ROW,
        hover: (item: { index: number }) => {
            if (item.index !== index) {
                moveRow(item.index, index);
                item.index = index;
            }
        },
        drop: () => onDrop(),
    });
    drag(drop(ref));

    return (
        <tr
            ref={ref}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
        >
            {children}
        </tr>
    );
}

export default function CategoriasPage() {
    const { categorias, loading, fetchAll, create, update, toggleEstado, reorder, remove } = useCategorias();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [localCats, setLocalCats] = useState<Categoria[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    useEffect(() => { setLocalCats(categorias); setHasChanges(false); }, [categorias]);

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: { nombre: '', descripcion: '', icono_web: '', icono_mobil: '', orden: 0, estado: true },
    });

    useEffect(() => {
        if (modalOpen) {
            if (editing) {
                reset({
                    nombre: editing.nombre,
                    descripcion: editing.descripcion || '',
                    icono_web: editing.icono_web || '',
                    icono_mobil: editing.icono_mobil || '',
                    orden: editing.orden || 0,
                    estado: editing.estado,
                });
            } else {
                reset({ nombre: '', descripcion: '', icono_web: '', icono_mobil: '', orden: 0, estado: true });
            }
        }
    }, [modalOpen, editing, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (editing) {
                await update(editing.id_categoria, data);
                toast.success('Categoría actualizada');
            } else {
                await create(data);
                toast.success('Categoría creada');
            }
            setModalOpen(false);
            setEditing(null);
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta categoría?')) return;
        try {
            await remove(id);
            toast.success('Categoría eliminada');
        } catch (err: any) {
            toast.error(err.message || 'Error al eliminar');
        }
    };

    const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
        setLocalCats((prev) => {
            const updated = [...prev];
            const [removed] = updated.splice(dragIndex, 1);
            updated.splice(hoverIndex, 0, removed);
            return updated;
        });
        setHasChanges(true);
    }, []);

    const handleDrop = useCallback(async () => {
        const items = localCats.map((cat, i) => ({
            id_categoria: Number(cat.id_categoria),
            orden: i,
        }));
        try {
            await reorder(items);
            toast.success('Orden actualizado');
            setHasChanges(false);
        } catch (err: any) {
            toast.error(err.message || 'Error al reordenar');
            setLocalCats(categorias);
            setHasChanges(false);
        }
    }, [localCats, reorder, toast, categorias]);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Categorías ({localCats.length})
                    </h3>
                    <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> Nueva categoría
                    </Button>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : localCats.length === 0 ? (
                        <p className="text-center text-gray-400 py-12">No hay categorías creadas</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <th className="w-10 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"></th>
                                        <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Orden</th>
                                        <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                                        <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descripción</th>
                                        <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Icono Web</th>
                                        <th className="text-center py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                                        <th className="text-right py-2 pl-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {localCats.map((cat, index) => (
                                        <DragRow key={cat.id_categoria} index={index} moveRow={moveRow} onDrop={handleDrop}>
                                            <td className="py-3 pl-2 text-gray-400 cursor-grab active:cursor-grabbing">
                                                <GripVertical className="h-4 w-4" />
                                            </td>
                                            <td className="py-3 pr-4 text-gray-500">{index}</td>
                                            <td className="py-3 px-4 font-medium text-gray-800 dark:text-white/90">{cat.nombre}</td>
                                            <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{cat.descripcion || '—'}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                    {(() => { const Ic = getIcon(cat.icono_web); return Ic ? <Ic className="h-4 w-4" /> : null; })()}
                                                    <span>{cat.icono_web || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge size="sm" color={cat.estado ? 'success' : 'error'}>
                                                    {cat.estado ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 pl-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => { setEditing(cat); setModalOpen(true); }}>
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => toggleEstado(cat.id_categoria, !cat.estado)}>
                                                        {cat.estado ? 'Desactivar' : 'Activar'}
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleDelete(cat.id_categoria)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </DragRow>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} className="max-w-[500px] p-5">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                            {editing ? 'Editar categoría' : 'Nueva categoría'}
                        </h4>

                        <div>
                            <Label>Nombre <span className="text-error-500">*</span></Label>
                            <Controller name="nombre" control={control} render={({ field }) => <Input {...field} error={!!errors.nombre} />} />
                            {errors.nombre && <p className="mt-1 text-xs text-error-500">{errors.nombre.message}</p>}
                        </div>

                        <div>
                            <Label>Descripción</Label>
                            <Controller name="descripcion" control={control} render={({ field }) => <Input {...field} />} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Controller name="icono_web" control={control} render={({ field }) => (
                                    <IconPicker value={field.value || ''} onChange={field.onChange} label="Icono Web" />
                                )} />
                            </div>
                            <div>
                                <Controller name="icono_mobil" control={control} render={({ field }) => (
                                    <IconPicker value={field.value || ''} onChange={field.onChange} label="Icono Móvil" />
                                )} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Orden</Label>
                                <Controller name="orden" control={control} render={({ field }) => <Input {...field} type="number" />} />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <Controller
                                    name="estado"
                                    control={control}
                                    render={({ field }) => (
                                        <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-brand-500" />
                                    )}
                                />
                                <Label className="!mb-0">Activo</Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" size="sm" onClick={() => { setModalOpen(false); setEditing(null); }}>
                                Cancelar
                            </Button>
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DndProvider>
    );
}
