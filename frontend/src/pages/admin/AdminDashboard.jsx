import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, TrendingDown, Users, MapPin, FileText, MessageSquare, Activity, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    emergencyLocations: 0,
    reportsToday: 0,
    feedbackReceived: 0,
    responseTime: 0
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Animated counter effect
  useEffect(() => {
    const targetStats = {
      totalUsers: 12847,
      activeUsers: 8923,
      emergencyLocations: 156,
      reportsToday: 47,
      feedbackReceived: 892,
      responseTime: 2.4
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setStats({
        totalUsers: Math.floor(targetStats.totalUsers * progress),
        activeUsers: Math.floor(targetStats.activeUsers * progress),
        emergencyLocations: Math.floor(targetStats.emergencyLocations * progress),
        reportsToday: Math.floor(targetStats.reportsToday * progress),
        feedbackReceived: Math.floor(targetStats.feedbackReceived * progress),
        responseTime: Number((targetStats.responseTime * progress).toFixed(1))
      });

      if (step >= steps) {
        clearInterval(timer);
        setStats(targetStats);
        setIsLoaded(true);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  // Chart data
  const userGrowthData = [
    { month: 'Jan', users: 1200, newUsers: 200, activeUsers: 890 },
    { month: 'Feb', users: 1800, newUsers: 600, activeUsers: 1340 },
    { month: 'Mar', users: 2400, newUsers: 600, activeUsers: 1780 },
    { month: 'Apr', users: 3200, newUsers: 800, activeUsers: 2400 },
    { month: 'May', users: 4100, newUsers: 900, activeUsers: 3100 },
    { month: 'Jun', users: 5200, newUsers: 1100, activeUsers: 3900 },
    { month: 'Jul', users: 6800, newUsers: 1600, activeUsers: 5100 },
    { month: 'Aug', users: 8400, newUsers: 1600, activeUsers: 6300 },
    { month: 'Sep', users: 10200, newUsers: 1800, activeUsers: 7650 },
    { month: 'Oct', users: 11800, newUsers: 1600, activeUsers: 8850 },
    { month: 'Nov', users: 12600, newUsers: 800, activeUsers: 9450 },
    { month: 'Dec', users: 12847, newUsers: 247, activeUsers: 8923 }
  ];

  const locationData = [
    { name: 'Hospitals', value: 45, color: 'hsl(var(--primary))' },
    { name: 'Fire Stations', value: 32, color: 'hsl(var(--destructive))' },
    { name: 'Police Stations', value: 28, color: 'hsl(var(--warning))' },
    { name: 'Clinics', value: 51, color: 'hsl(var(--success))' }
  ];

  const reportsTrendData = [
    { day: 'Mon', reports: 12, resolved: 10, pending: 2 },
    { day: 'Tue', reports: 19, resolved: 16, pending: 3 },
    { day: 'Wed', reports: 15, resolved: 13, pending: 2 },
    { day: 'Thu', reports: 22, resolved: 18, pending: 4 },
    { day: 'Fri', reports: 28, resolved: 24, pending: 4 },
    { day: 'Sat', reports: 18, resolved: 15, pending: 3 },
    { day: 'Sun', reports: 14, resolved: 12, pending: 2 }
  ];

  const responseTimeData = [
    { hour: '00:00', time: 3.2 },
    { hour: '04:00', time: 2.8 },
    { hour: '08:00', time: 4.1 },
    { hour: '12:00', time: 3.7 },
    { hour: '16:00', time: 2.9 },
    { hour: '20:00', time: 2.4 }
  ];

  const chartConfig = {
    users: {
      label: "Total Users",
      color: "hsl(var(--primary))",
    },
    newUsers: {
      label: "New Users",
      color: "hsl(var(--success))",
    },
    activeUsers: {
      label: "Active Users",
      color: "hsl(var(--warning))",
    },
    reports: {
      label: "Reports",
      color: "hsl(var(--primary))",
    },
    resolved: {
      label: "Resolved",
      color: "hsl(var(--success))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--warning))",
    },
    time: {
      label: "Response Time (min)",
      color: "hsl(var(--primary))",
    },
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, delay = 0 }) => (
    <Card className={`hover-scale ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: `${delay}ms` }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
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
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
              {trendValue}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const recentActivities = [
    { id: 1, action: 'New user registration', user: 'John Doe', time: '2 min ago', type: 'user' },
    { id: 2, action: 'Emergency report submitted', user: 'Medical Center', time: '5 min ago', type: 'emergency' },
    { id: 3, action: 'Location updated', user: 'City Hospital', time: '12 min ago', type: 'location' },
    { id: 4, action: 'Feedback received', user: 'Sarah Wilson', time: '18 min ago', type: 'feedback' },
    { id: 5, action: 'Report resolved', user: 'Admin Team', time: '25 min ago', type: 'resolved' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4 text-primary" />;
      case 'emergency': return <Activity className="h-4 w-4 text-destructive" />;
      case 'location': return <MapPin className="h-4 w-4 text-success" />;
      case 'feedback': return <MessageSquare className="h-4 w-4 text-warning" />;
      case 'resolved': return <FileText className="h-4 w-4 text-success" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with EasyConnect today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          trendValue="12.5"
          delay={0}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          subtitle="69.5% of total"
          icon={Activity}
          trend="up"
          trendValue="8.3"
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
          trend="down"
          trendValue="2.4"
          delay={300}
        />
        <StatCard
          title="Total Feedback"
          value={stats.feedbackReceived}
          icon={MessageSquare}
          trend="up"
          trendValue="15.2"
          delay={400}
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.responseTime} min`}
          icon={Clock}
          trend="down"
          trendValue="12.8"
          delay={500}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className={`${isLoaded ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              User Growth Trends
              <Badge variant="secondary">+24.5%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <CustomTooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="hsl(var(--success))"
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Reports Trend */}
        <Card className={`${isLoaded ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '700ms' }}>
          <CardHeader>
            <CardTitle>Weekly Reports Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <CustomTooltip />
                  <Bar 
                    dataKey="resolved" 
                    stackId="a" 
                    fill="hsl(var(--success))" 
                    radius={[0, 0, 4, 4]} 
                  />
                  <Bar 
                    dataKey="pending" 
                    stackId="a" 
                    fill="hsl(var(--warning))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card className={`${isLoaded ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '800ms' }}>
          <CardHeader>
            <CardTitle>Emergency Locations Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <CustomPieTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {locationData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Time Trend */}
        <Card className={`${isLoaded ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '900ms' }}>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <CustomTooltip />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className={`${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1000ms' }}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${1100 + index * 100}ms` }}
              >
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    by {activity.user}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;