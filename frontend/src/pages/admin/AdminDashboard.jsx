import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Tooltip
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, MapPin, FileText, MessageSquare,
  Activity, Clock, ShieldAlert, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const AdminDashboard = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [animReady, setAnimReady] = useState(false);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    emergencyLocations: 0,
    reportsToday: 0,
    feedbackReceived: 0,
    responseTime: 0
  });

  // Static response time chart (dummy)
  const responseTimeData = [
    { hour: '00:00', time: 3.2 },
    { hour: '04:00', time: 2.8 },
    { hour: '08:00', time: 4.1 },
    { hour: '12:00', time: 3.7 },
    { hour: '16:00', time: 2.9 },
    { hour: '20:00', time: 2.4 }
  ];

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/dashboard/summary`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load dashboard');
      setSummary(data.data);
      animateCounters(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimReady(true), 50);
    }
  }, [BASE_URL, token]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const animateCounters = (data) => {
    const target = {
      totalUsers: data.userCount,
      activeUsers: data.activeUsers,
      emergencyLocations: data.locationCount,
      reportsToday: data.reportsToday,
      feedbackReceived: data.feedbackCount,
      responseTime: data.avgResponseTime
    };
    const duration = 1500;
    const frames = 60;
    const stepTime = duration / frames;
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const t = frame / frames;
      setStats({
        totalUsers: Math.round(target.totalUsers * t),
        activeUsers: Math.round(target.activeUsers * t),
        emergencyLocations: Math.round(target.emergencyLocations * t),
        reportsToday: Math.round(target.reportsToday * t),
        feedbackReceived: Math.round(target.feedbackReceived * t),
        responseTime: Number((target.responseTime * t).toFixed(1))
      });
      if (frame >= frames) {
        clearInterval(timer);
        setStats(target);
      }
    }, stepTime);
  };

  /* ------------ COLOR LOGIC FOR LOCATION DISTRIBUTION ------------- */
  // Hash function to produce a numeric seed from a string (serviceId/name)
  const hashString = (str = '') => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  };

  // Generate an HSL color from a seed; adjust if collision
  const generateDistinctColors = (items) => {
    const used = new Set();
    return items.map(item => {
      let baseColor = item.color; // backend-provided (may be undefined)
      if (baseColor && !used.has(baseColor)) {
        used.add(baseColor);
        return { ...item, _finalColor: baseColor };
      }
      // Need to generate
      const seed = hashString(item.serviceId?.toString() || item.name || JSON.stringify(item));
      // Derive a hue from seed
      let hue = seed % 360;
      let attempts = 0;
      // If conflict, nudge hue until unique
      while (attempts < 50) {
        const candidate = `hsl(${hue} 65% 52%)`;
        if (!used.has(candidate)) {
          used.add(candidate);
          return { ...item, _finalColor: candidate };
        }
        hue = (hue + 37) % 360; // jump 37 degrees each attempt
        attempts++;
      }
      // Fallback (shouldn't happen)
      const fallback = `hsl(${Math.random() * 360} 65% 52%)`;
      used.add(fallback);
      return { ...item, _finalColor: fallback };
    });
  };

  const locationDistributionRaw = summary?.locationDistribution || [];
  const locationDistribution = useMemo(
    () => generateDistinctColors(locationDistributionRaw),
    [locationDistributionRaw]
  );

  const recentActivity = summary?.recentActivity || [];
  const userGrowthData = summary?.userGrowth || [];
  const reportsTrendData = summary?.reportsTrend || [];

  const pieColors = locationDistribution.map(ld => ld._finalColor);

  const trendPercent = (seriesKey) => {
    if (!userGrowthData || userGrowthData.length < 2) return { dir: 'up', val: 0 };
    const last = userGrowthData[userGrowthData.length - 1]?.[seriesKey] || 0;
    const prev = userGrowthData[userGrowthData.length - 2]?.[seriesKey] || 0;
    if (prev === 0) return { dir: 'up', val: 100 };
    const change = ((last - prev) / prev) * 100;
    return { dir: change >= 0 ? 'up' : 'down', val: Math.abs(change).toFixed(1) };
  };
  const userTrend = trendPercent('users');
  const feedbackTrend = trendPercent('newUsers');

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, delay = 0 }) => (
    <Card
      className={`transition-all duration-700 ${animReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-success mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive mr-1" />
            )}
            <span
              className={`text-xs font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'
                }`}
            >
              {trendValue}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-background/95 border border-border rounded-md p-2 shadow-sm text-xs">
          <p className="font-medium mb-1">{label}</p>
          {payload.map(p => (
            <p key={p.dataKey} style={{ color: p.color }}>
              {p.name || p.dataKey}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background/95 border border-border rounded-md p-2 shadow-sm text-xs">
          <p className="font-medium">{item.name}</p>
          <p>Count: {item.count}</p>
        </div>
      );
    }
    return null;
  };

  const relativeTime = (date) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6 p-6">
      {loading && (
        <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      )}

      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Real‑time overview of user engagement, locations, and feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={userTrend.dir}
          trendValue={userTrend.val}
          delay={0}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          subtitle="Active = Total"
          icon={Activity}
          trend={userTrend.dir}
          trendValue={userTrend.val}
          delay={100}
        />
        <StatCard
          title="Emergency Locations"
          value={stats.emergencyLocations}
          icon={MapPin}
          trend="up"
          trendValue="4.1"
          delay={200}
        />
        <StatCard
          title="Reports Today"
          value={stats.reportsToday}
          icon={FileText}
          trend="up"
          trendValue="0.0"
          delay={300}
        />
        <StatCard
          title="Total Feedback"
          value={stats.feedbackReceived}
          icon={MessageSquare}
          trend={feedbackTrend.dir}
          trendValue={feedbackTrend.val}
          delay={400}
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.responseTime} min`}
          icon={Clock}
          trend="down"
          trendValue="0.0"
          delay={500}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className={`${animReady ? 'animate-scale-in' : 'opacity-0'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              User Growth
              <Badge variant="secondary">Cap / month = 100</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorUsers)"
                    strokeWidth={2}
                    name="Cumulative Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stroke="hsl(var(--success))"
                    fill="url(#colorNew)"
                    strokeWidth={2}
                    name="New Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Reports Trend */}
        <Card className={`${animReady ? 'animate-scale-in' : 'opacity-0'}`}>
          <CardHeader>
            <CardTitle>Reports (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsTrendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="resolved" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 4, 4]} name="Resolved" />
                  <Bar dataKey="pending" stackId="a" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card className={`${animReady ? 'animate-scale-in' : 'opacity-0'}`}>
          <CardHeader>
            <CardTitle>Location Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {locationDistribution.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No active locations.
              </div>
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationDistribution}
                        dataKey="count"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        paddingAngle={4}
                        nameKey="name"
                      >
                        {locationDistribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry._finalColor} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {locationDistribution.map((item, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item._finalColor }}
                      />
                      <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                      <span className="text-xs font-medium ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Response Time (Static) */}
        <Card className={`${animReady ? 'animate-scale-in' : 'opacity-0'}`}>
          <CardHeader>
            <CardTitle>Response Time </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    name="Minutes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className={`${animReady ? 'animate-fade-in' : 'opacity-0'}`}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No recent activity.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/40 transition"
                >
                  <div className="flex-shrink-0">
                    {act.type === 'user' ? (
                      <Users className="w-5 h-5 text-primary" />
                    ) : act.type === 'feedback' ? (
                      <MessageSquare className="w-5 h-5 text-warning" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {act.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      by {act.actor}
                      {act.type === 'feedback' && act.meta?.location
                        ? ` • ${act.meta.location}`
                        : ''}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {relativeTime(act.at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;