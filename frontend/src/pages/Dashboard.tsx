import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchStatistics } from '../store/slices/dashboardSlice';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, LinearProgress
} from '@mui/material';
import { Description, Science, BugReport, CheckCircle, Error, Block, PlayArrow, SmartToy } from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#2e7d32', '#c62828', '#ef6c00', '#1565c0', '#7c4dff', '#00838f'];

const KpiCard = ({ title, value, icon, color, subtitle }: any) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ bgcolor: `${color}15`, borderRadius: 2, p: 1.5, display: 'flex' }}>
        {React.cloneElement(icon, { sx: { fontSize: 32, color } })}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => { dispatch(fetchStatistics()); }, [dispatch]);

  if (loading || !stats) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress size={48} /></Box>
  );

  const execPieData = (stats.executions?.byStatus || []).map((s: any) => ({ name: s._id, value: s.count }));
  const bugPieData = (stats.bugs?.bySeverity || []).map((s: any) => ({ name: s._id, value: s.count }));
  const trendData = stats.trend || [];

  const getExecutionColor = (status: string) => {
    const colorMap: any = {
      'passed': '#2e7d32',
      'failed': '#c62828',
      'blocked': '#ef6c00',
      'skipped': '#757575'
    };
    return colorMap[status.toLowerCase()] || '#1565c0';
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="User Stories" value={stats.stories?.total || 0} icon={<Description />} color="#1565c0" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Cas de Test" value={stats.testCases?.total || 0} icon={<Science />} color="#7c4dff"
            subtitle={`${stats.testCases?.aiGenerated || 0} générés par IA`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Taux de Réussite" value={`${stats.executions?.passRate || 0}%`} icon={<CheckCircle />} color="#2e7d32"
            subtitle={`${stats.executions?.total || 0} exécutions`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Bugs Ouverts" value={stats.bugs?.open || 0} icon={<BugReport />} color="#c62828"
            subtitle={`${stats.bugs?.total || 0} total`} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Résultats d'Exécution</Typography>
              {execPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={execPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {execPieData.map((entry: any, i: number) => <Cell key={i} fill={getExecutionColor(entry.name)} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>Aucune exécution</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Bugs par Sévérité</Typography>
              {bugPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={bugPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {bugPieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>Aucun bug</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Résumé</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Couverture d'exécution</Typography>
                <LinearProgress variant="determinate"
                  value={stats.testCases?.total > 0 ? Math.min((stats.executions?.total / stats.testCases?.total) * 100, 100) : 0}
                  sx={{ height: 10, borderRadius: 5, mt: 0.5 }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2"><CheckCircle sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />Passés</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.executions?.passed || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2"><Error sx={{ fontSize: 14, color: 'error.main', mr: 0.5 }} />Échoués</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.executions?.failed || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2"><Block sx={{ fontSize: 14, color: 'warning.main', mr: 0.5 }} />Bloqués</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.executions?.blocked || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2"><SmartToy sx={{ fontSize: 14, color: '#7c4dff', mr: 0.5 }} />Tests IA</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.testCases?.aiGenerated || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {trendData.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Tendance des Exécutions (30 jours)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="passed" stroke="#2e7d32" name="Passés" strokeWidth={2} />
                <Line type="monotone" dataKey="failed" stroke="#c62828" name="Échoués" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#1565c0" name="Total" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Résultats d'Exécution par User Story</Typography>
              {stats.executions?.byStory && stats.executions.byStory.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.executions.byStory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="passed" fill="#2e7d32" name="Passés" stackId="a" />
                    <Bar dataKey="failed" fill="#c62828" name="Échoués" stackId="a" />
                    <Bar dataKey="blocked" fill="#ef6c00" name="Bloqués" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                  Aucune donnée d'exécution par story
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Bugs par Sévérité et User Story</Typography>
              {stats.bugs?.byStory && stats.bugs.byStory.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.bugs.byStory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="critical" fill="#c62828" name="Critique" stackId="a" />
                    <Bar dataKey="high" fill="#ef6c00" name="Haute" stackId="a" />
                    <Bar dataKey="medium" fill="#ffa726" name="Moyenne" stackId="a" />
                    <Bar dataKey="low" fill="#66bb6a" name="Basse" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
                  Aucun bug par story
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
