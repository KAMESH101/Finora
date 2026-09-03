import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  X,
  TrendingUp,
  Flame,
  AlertTriangle,
  Lightbulb,
  Layers,
  ShieldAlert,
  Info,
  ZoomIn,
  RotateCcw
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getWallet, Transaction, defaultGeoTransactions } from '../utils/walletManager';
import { formatCurrency, formatIndianDateShort } from '../mockData';
import { LeafletHeatmap } from './LeafletHeatmap';

// Custom Category Marker Icons with Amount Badges
const createCustomIcon = (category: string, amount: number) => {
  let color = '#3B82F6'; // default blue
  if (category === 'Food & Drinks' || category === 'Food') color = '#1F7A5C'; // money-in
  if (category === 'Shopping') color = '#C98A2C'; // gold
  if (category === 'Travel') color = '#8B5CF6'; // purple
  if (category === 'Entertainment') color = '#EC4899'; // pink
  if (category === 'Bills & Utilities') color = '#EF4444'; // red

  const amountStr = amount >= 1000 ? `₹${(amount / 1000).toFixed(1)}k` : `₹${amount}`;

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div style="background-color: ${color}; color: #ffffff; padding: 2px 7px; border-radius: 12px; font-size: 11px; font-weight: 800; border: 2px solid #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4); white-space: nowrap;">
        ${amountStr}
      </div>
      <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${color}; margin-top: -1px;"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-amount-marker',
    html: html,
    iconSize: [50, 32],
    iconAnchor: [25, 32],
    popupAnchor: [0, -34]
  });
};

interface GeoSpendingMapProps {
  onClose?: () => void;
}

// Controller component to invalidate size and smoothly fly to coordinates
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);

  return null;
}

export function GeoSpendingMap({ onClose }: GeoSpendingMapProps) {
  const walletData = getWallet();
  const rawTxns = walletData.transactions || [];
  const allTransactions: Transaction[] = rawTxns.some(t => t.location?.lat)
    ? rawTxns
    : defaultGeoTransactions;

  // View state
  const [mapMode, setMapMode] = useState<'markers' | 'heatmap' | 'both'>('both');
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.0760, 72.8777]); // Mumbai default center
  const [mapZoom, setMapZoom] = useState<number>(11);

  // Filter state
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>('');

  // Extract unique categories & payment methods
  const categories = useMemo(() => {
    const set = new Set<string>();
    allTransactions.forEach(t => t.category && set.add(t.category));
    return Array.from(set);
  }, [allTransactions]);

  const paymentMethods = useMemo(() => {
    const set = new Set<string>();
    allTransactions.forEach(t => t.paymentMethod && set.add(t.paymentMethod));
    return Array.from(set);
  }, [allTransactions]);

  // Filtered transactions logic
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      if (t.type !== 'debit') return false;

      // Category Filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Payment Filter
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;

      // Amount Filter
      if (maxAmountFilter && maxAmountFilter.trim() !== '') {
        const val = parseFloat(maxAmountFilter);
        if (!isNaN(val) && t.amount > val) return false;
      }

      // Date Filter
      if (dateFilter !== 'all') {
        const txnDate = new Date(t.date);
        const now = new Date();
        if (dateFilter === 'today') {
          if (txnDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
          if (txnDate < weekAgo) return false;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
          if (txnDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [allTransactions, categoryFilter, paymentFilter, maxAmountFilter, dateFilter]);

  // Split into map-valid (has lat/lng) and missing-location
  const validGeoTransactions = useMemo(() => {
    return filteredTransactions.filter(
      t => t.location && typeof t.location.lat === 'number' && typeof t.location.lng === 'number'
    );
  }, [filteredTransactions]);

  const missingLocationCount = filteredTransactions.length - validGeoTransactions.length;

  // Auto center on first transaction or reset
  useEffect(() => {
    if (validGeoTransactions.length > 0) {
      setMapCenter([validGeoTransactions[0].location!.lat, validGeoTransactions[0].location!.lng]);
    }
  }, [validGeoTransactions.length]);

  // Analytics Computations
  const totalSpending = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const avgTransaction = useMemo(() => {
    return filteredTransactions.length > 0 ? totalSpending / filteredTransactions.length : 0;
  }, [filteredTransactions, totalSpending]);

  // Top spending locations
  const locationSummary = useMemo(() => {
    const map: { [key: string]: { location: string; amount: number; count: number; lat: number; lng: number; categories: { [cat: string]: number } } } = {};
    filteredTransactions.forEach(t => {
      const locName = t.location?.address || t.merchant;
      if (!map[locName]) {
        map[locName] = {
          location: locName,
          amount: 0,
          count: 0,
          lat: t.location?.lat || 19.0760,
          lng: t.location?.lng || 72.8777,
          categories: {}
        };
      }
      map[locName].amount += t.amount;
      map[locName].count += 1;
      map[locName].categories[t.category] = (map[locName].categories[t.category] || 0) + t.amount;
    });

    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const topSpendingLocation = locationSummary[0]?.location || 'N/A';

  // Top Category
  const topCategory = useMemo(() => {
    const catMap: { [key: string]: number } = {};
    filteredTransactions.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'N/A';
  }, [filteredTransactions]);

  // Hotspots (High spending concentration)
  const hotspots = useMemo(() => {
    return locationSummary.map(loc => {
      const dominantCat = Object.entries(loc.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
      return {
        ...loc,
        dominantCategory: dominantCat
      };
    }).slice(0, 3);
  }, [locationSummary]);

  // Statistical Anomaly Detection (Median/IQR per location)
  const anomalies = useMemo(() => {
    const results: { txn: Transaction; reason: string }[] = [];
    const grouped: { [loc: string]: Transaction[] } = {};

    filteredTransactions.forEach(t => {
      const loc = t.location?.address || t.merchant;
      if (!grouped[loc]) grouped[loc] = [];
      grouped[loc].push(t);
    });

    Object.entries(grouped).forEach(([loc, txns]) => {
      if (txns.length < 2) return;
      const amounts = txns.map(t => t.amount).sort((a, b) => a - b);
      const q1 = amounts[Math.floor(amounts.length * 0.25)];
      const q3 = amounts[Math.floor(amounts.length * 0.75)];
      const iqr = q3 - q1;
      const threshold = q3 + 1.5 * iqr;

      txns.forEach(t => {
        if (t.amount > threshold && t.amount > 2000) {
          results.push({
            txn: t,
            reason: `⚠️ ${formatCurrency(t.amount)} is unusually high compared with your normal spending at ${loc}.`
          });
        }
      });
    });

    return results;
  }, [filteredTransactions]);

  // Smart Insights Generation
  const insights = useMemo(() => {
    const list: string[] = [];
    if (locationSummary.length > 0) {
      list.push(`Highest spending location is ${locationSummary[0].location} (${formatCurrency(locationSummary[0].amount)}).`);
    }
    if (topCategory !== 'N/A') {
      list.push(`Dominant category across mapped transactions is ${topCategory}.`);
    }
    if (totalSpending > 10000) {
      const potentialSave = Math.round(totalSpending * 0.15);
      list.push(`Potential savings: Cutting 15% off high-spend hotspots could save ~${formatCurrency(potentialSave)}.`);
    }
    if (missingLocationCount > 0) {
      list.push(`${missingLocationCount} transactions occurred online or without location tags.`);
    }
    return list;
  }, [locationSummary, topCategory, totalSpending, missingLocationCount]);

  // Heatmap Points
  const heatmapPoints = useMemo(() => {
    return validGeoTransactions.map(t => ({
      lat: t.location!.lat,
      lng: t.location!.lng,
      intensity: t.amount
    }));
  }, [validGeoTransactions]);

  const maxHeatAmount = useMemo(() => {
    return Math.max(...validGeoTransactions.map(t => t.amount), 5000);
  }, [validGeoTransactions]);

  const handleLocationClick = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(15);
  };

  const handleResetFilters = () => {
    setDateFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setMaxAmountFilter('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border" style={{ background: 'var(--secondary)' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl text-white shadow-md" style={{ background: 'var(--ink)' }}>
            <MapPin className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl tracking-tight text-foreground">GeoSmart Spending Map</h1>
              <Badge variant="secondary" className="text-white border-0" style={{ background: 'var(--ink)' }}>
                OpenStreetMap Powered
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Visualize and analyze where your money goes with interactive spatial intelligence</p>
          </div>
        </div>

        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="self-start sm:self-auto">
            <X className="w-4 h-4 mr-1.5" /> Back to Dashboard
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Payment Method</Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map(p => (
                    <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Max Amount (₹)</Label>
              <Input
                type="number"
                placeholder="No Limit"
                value={maxAmountFilter}
                onChange={e => setMaxAmountFilter(e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>

            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Map Container (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="bg-card border-border overflow-hidden shadow-lg">
            <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: 'var(--ink)' }} /> Mapped Transactions
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {validGeoTransactions.length} Location Markers
                </Badge>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={mapMode === 'markers' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setMapMode('markers')}
                >
                  <MapPin className="w-3.5 h-3.5 mr-1" /> Markers
                </Button>
                <Button
                  size="sm"
                  variant={mapMode === 'heatmap' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setMapMode('heatmap')}
                >
                  <Flame className="w-3.5 h-3.5 mr-1" /> Heatmap
                </Button>
                <Button
                  size="sm"
                  variant={mapMode === 'both' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setMapMode('both')}
                >
                  <Layers className="w-3.5 h-3.5 mr-1" /> Both
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Leaflet Map display container */}
              <div className="relative w-full h-[580px] bg-slate-900 overflow-hidden" style={{ minHeight: '580px' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  scrollWheelZoom={true}
                  className="w-full h-full z-0"
                  style={{ height: '580px', width: '100%' }}
                >
                  <MapController center={mapCenter} zoom={mapZoom} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Heatmap Layer */}
                  {(mapMode === 'heatmap' || mapMode === 'both') && (
                    <LeafletHeatmap points={heatmapPoints} maxVal={maxHeatAmount} />
                  )}

                  {/* Markers Layer with Marker Clustering */}
                  {(mapMode === 'markers' || mapMode === 'both') && (
                    <MarkerClusterGroup chunkedLoading spiderfyOnMaxZoom={true}>
                      {validGeoTransactions.map(t => (
                        <Marker
                          key={t.id}
                          position={[t.location!.lat, t.location!.lng]}
                          icon={createCustomIcon(t.category, t.amount)}
                        >
                          <Popup className="geo-smart-popup">
                            <div className="p-1.5 min-w-[210px]">
                              <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                                <span className="font-bold text-sm text-foreground">{t.merchant}</span>
                                <Badge className="text-[10px]" variant="outline">{t.category}</Badge>
                              </div>
                              <div className="space-y-1 text-xs">
                                <p className="text-base font-extrabold" style={{ color: 'var(--ink)' }}>
                                  {formatCurrency(t.amount)}
                                </p>
                                <p className="text-muted-foreground text-[11px]">📍 {t.location!.address}</p>
                                <div className="flex items-center justify-between pt-1.5 text-[11px] text-muted-foreground">
                                  <span>📅 {formatIndianDateShort(t.date)}</span>
                                  <span className="uppercase font-semibold px-1.5 py-0.5 bg-muted rounded">
                                    {t.paymentMethod}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MarkerClusterGroup>
                  )}
                </MapContainer>

                {/* Floating Map Category Legend */}
                <div className="absolute bottom-4 left-4 z-[400] bg-background/90 backdrop-blur-md p-3 rounded-xl border border-border text-xs shadow-lg">
                  <p className="font-semibold text-xs mb-1.5 text-foreground">Spending Categories</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground text-[11px]">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/>Food & Drinks</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/>Shopping</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"/>Travel</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"/>Entertainment</div>
                  </div>
                </div>
              </div>

              {/* Missing Location Data Banner */}
              {missingLocationCount > 0 && (
                <div className="p-3 border-t text-gold flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-gold flex-shrink-0" />
                    <span><strong>{missingLocationCount} transactions</strong> have no GPS coordinates (e.g. online subscriptions). Included in overall spending totals.</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Analytics Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Spending Summary KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-card border-border shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Total Spending</p>
              <p className="text-xl font-extrabold text-foreground">{formatCurrency(totalSpending)}</p>
            </Card>

            <Card className="p-4 bg-card border-border shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Avg Transaction</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--ink)' }}>{formatCurrency(avgTransaction)}</p>
            </Card>
          </div>

          {/* Anomaly Alerts */}
          {anomalies.length > 0 && (
            <Card className="border-red-500/30 bg-red-500/5 shadow-sm">
              <CardHeader className="p-3.5 pb-1">
                <CardTitle className="text-xs font-bold text-money-out flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Anomaly Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 pt-1 space-y-1.5 text-xs">
                {anomalies.map((a, idx) => (
                  <div key={idx} className="p-2 rounded bg-background border border-red-500/20 text-muted-foreground">
                    <p className="font-medium text-foreground">{a.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Top Spending Locations */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: 'var(--ink)' }} /> Top Spending Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              {locationSummary.slice(0, 5).map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLocationClick(loc.lat, loc.lng)}
                  className="fin-clickable p-3 rounded-xl border border-border/60 hover:border-money-in bg-muted/20 hover:bg-muted/50 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs" style={{ background: 'color-mix(in oklab, var(--ink) 10%, transparent)', color: 'var(--ink)' }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground truncate max-w-[150px]">{loc.location}</p>
                      <p className="text-[11px] text-muted-foreground">{loc.count} visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-foreground">{formatCurrency(loc.amount)}</p>
                    <span className="text-[10px] flex items-center justify-end gap-0.5" style={{ color: 'var(--ink)' }}>
                      <ZoomIn className="w-3 h-3" /> Focus Map
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Spending Hotspots */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Flame className="w-4 h-4 text-money-out" /> 🔥 Spending Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              {hotspots.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLocationClick(h.lat, h.lng)}
                  className="p-3 rounded-xl border border-border bg-orange-500/5 hover:bg-orange-500/10 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{h.location}</span>
                      <Badge variant="outline" className="text-[10px]">{h.dominantCategory}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{h.count} transactions in zone</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-xs text-foreground">{formatCurrency(h.amount)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Smart Insights */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-gold" /> Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2 text-xs">
              {insights.map((ins, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-gold/20 text-muted-foreground flex items-start gap-2" style={{ background: 'color-mix(in oklab, var(--gold) 6%, transparent)' }}>
                  <span className="font-bold mt-0.5" style={{ color: 'var(--ink)' }}>&bull;</span>
                  <p className="text-foreground/90">{ins}</p>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
