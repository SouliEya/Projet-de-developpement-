import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Chip, IconButton,
  CircularProgress, Alert, Stack, Divider, Grid, Paper, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select
} from '@mui/material';
import {
  Add, Settings, CheckCircle, PlayArrow, Stop, BarChart,
  RadioButtonUnchecked, AccessTime, Close
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

interface Sprint {
  _id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: string;
  stories: any[];
  metrics?: {
    totalStories: number;
    completedStories: number;
    totalPoints: number;
    completedPoints: number;
    totalTests: number;
    openBugs: number;
  };
}

const Sprints: React.FC = () => {
  const navigate = useNavigate();
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: ''
  });
  const [openBurndown, setOpenBurndown] = useState(false);

  useEffect(() => {
    fetchActiveSprint();
    fetchSprints();
  }, []);

  const fetchActiveSprint = async () => {
    try {
      const response = await api.get('/sprints/active');
      setActiveSprint(response.data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Erreur sprint actif:', err);
      }
    }
  };

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sprints');
      setSprints(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async () => {
    try {
      await api.post('/sprints', newSprint);
      setOpenDialog(false);
      setNewSprint({ name: '', goal: '', startDate: '', endDate: '' });
      fetchSprints();
      fetchActiveSprint();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleStartSprint = async (id: string) => {
    try {
      await api.post(`/sprints/${id}/start`);
      fetchActiveSprint();
      fetchSprints();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du démarrage');
    }
  };

  const handleCompleteSprint = async (id: string) => {
    if (!window.confirm('Terminer ce sprint ?')) return;
    try {
      await api.post(`/sprints/${id}/complete`);
      fetchActiveSprint();
      fetchSprints();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la complétion');
    }
  };

  const handleStatusChange = async (storyId: string, newStatus: string) => {
    try {
      await api.put(`/stories/${storyId}`, { status: newStatus });
      fetchActiveSprint();
      fetchSprints();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getProgress = (metrics: any) => {
    if (!metrics || metrics.totalStories === 0) return 0;
    return Math.round((metrics.completedStories / metrics.totalStories) * 100);
  };

  const getStoriesByStatus = (stories: any[]) => {
    return {
      done: stories.filter(s => s.status === 'done'),
      inProgress: stories.filter(s => s.status === 'in_progress'),
      todo: stories.filter(s => s.status !== 'done' && s.status !== 'in_progress')
    };
  };

  const generateBurndownData = () => {
    if (!activeSprint) return [];
    
    const start = new Date(activeSprint.startDate);
    const end = new Date(activeSprint.endDate);
    const today = new Date();
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalStories = activeSprint.metrics?.totalStories || 0;
    const completedStories = activeSprint.metrics?.completedStories || 0;
    const remainingStories = totalStories - completedStories;
    
    const data = [];
    
    // Ligne idéale (burndown parfait)
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const ideal = totalStories - (totalStories / totalDays) * i;
      
      data.push({
        day: `J${i}`,
        date: date.toLocaleDateString('fr-FR'),
        ideal: Math.max(0, Math.round(ideal)),
        actual: i === 0 ? totalStories : (date <= today ? remainingStories : null)
      });
    }
    
    return data;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          🏃 Sprint Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => navigate('/backlog')}>
            Voir Backlog
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            Nouveau Sprint
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {activeSprint ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight={700}>
                🏃 {activeSprint.name}
              </Typography>
              <IconButton size="small">
                <Settings />
              </IconButton>
            </Box>

            <Box display="flex" gap={2} mb={3}>
              <Chip label={activeSprint.status} color="primary" />
              <Typography variant="body2" color="text.secondary">
                📅 {new Date(activeSprint.startDate).toLocaleDateString('fr-FR')} - {new Date(activeSprint.endDate).toLocaleDateString('fr-FR')}
              </Typography>
              <Typography variant="body2" color="warning.main">
                ⏱️ {getDaysRemaining(activeSprint.endDate)} jours restants
              </Typography>
            </Box>

            {activeSprint.goal && (
              <Typography variant="body2" color="text.secondary" paragraph>
                🎯 Objectif: {activeSprint.goal}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              📊 Métriques du Sprint
            </Typography>

            <Grid container spacing={2} mb={3}>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Stories</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ✅ {activeSprint.metrics?.completedStories || 0}/{activeSprint.metrics?.totalStories || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({getProgress(activeSprint.metrics)}%)
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Points</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {activeSprint.metrics?.completedPoints || 0}/{activeSprint.metrics?.totalPoints || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({activeSprint.metrics?.totalPoints ? Math.round((activeSprint.metrics.completedPoints / activeSprint.metrics.totalPoints) * 100) : 0}%)
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Tests</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {activeSprint.metrics?.totalTests || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Bugs</Typography>
                  <Typography variant="h5" fontWeight={700} color="error.main">
                    {activeSprint.metrics?.openBugs || 0} ouverts
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Progression:
            </Typography>
            <LinearProgress
              variant="determinate"
              value={getProgress(activeSprint.metrics)}
              sx={{ height: 10, borderRadius: 5, mb: 3 }}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              📋 Stories du Sprint
            </Typography>

            {activeSprint.stories && activeSprint.stories.length > 0 ? (
              <>
                {(() => {
                  const grouped = getStoriesByStatus(activeSprint.stories);
                  return (
                    <Stack spacing={3}>
                      {grouped.done.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} color="success.main" gutterBottom>
                            ✅ TERMINÉ ({grouped.done.length})
                          </Typography>
                          <Stack spacing={1}>
                            {grouped.done.map((story: any) => (
                              <Card key={story._id} variant="outlined">
                                <CardContent>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box flex={1}>
                                      <Typography variant="body1" fontWeight={600}>
                                        ✅ #{story._id.slice(-4)} {story.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Priorité: {story.priority}
                                      </Typography>
                                    </Box>
                                    <Select
                                      size="small"
                                      value={story.status}
                                      onChange={(e) => handleStatusChange(story._id, e.target.value)}
                                      sx={{ minWidth: 150 }}
                                    >
                                      <MenuItem value="todo">À faire</MenuItem>
                                      <MenuItem value="in_progress">En cours</MenuItem>
                                      <MenuItem value="ready_qa">Ready QA</MenuItem>
                                      <MenuItem value="testing">Testing</MenuItem>
                                      <MenuItem value="done">Terminé</MenuItem>
                                    </Select>
                                  </Box>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {grouped.inProgress.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} color="info.main" gutterBottom>
                            🔄 EN COURS ({grouped.inProgress.length})
                          </Typography>
                          <Stack spacing={1}>
                            {grouped.inProgress.map((story: any) => (
                              <Card key={story._id} variant="outlined">
                                <CardContent>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box flex={1}>
                                      <Typography variant="body1" fontWeight={600}>
                                        🔄 #{story._id.slice(-4)} {story.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Priorité: {story.priority}
                                      </Typography>
                                    </Box>
                                    <Select
                                      size="small"
                                      value={story.status}
                                      onChange={(e) => handleStatusChange(story._id, e.target.value)}
                                      sx={{ minWidth: 150 }}
                                    >
                                      <MenuItem value="todo">À faire</MenuItem>
                                      <MenuItem value="in_progress">En cours</MenuItem>
                                      <MenuItem value="ready_qa">Ready QA</MenuItem>
                                      <MenuItem value="testing">Testing</MenuItem>
                                      <MenuItem value="done">Terminé</MenuItem>
                                    </Select>
                                  </Box>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {grouped.todo.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} color="warning.main" gutterBottom>
                            ⏳ À FAIRE ({grouped.todo.length})
                          </Typography>
                          <Stack spacing={1}>
                            {grouped.todo.map((story: any) => (
                              <Card key={story._id} variant="outlined">
                                <CardContent>
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box flex={1}>
                                      <Typography variant="body1" fontWeight={600}>
                                        ⏳ #{story._id.slice(-4)} {story.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Priorité: {story.priority}
                                      </Typography>
                                    </Box>
                                    <Select
                                      size="small"
                                      value={story.status}
                                      onChange={(e) => handleStatusChange(story._id, e.target.value)}
                                      sx={{ minWidth: 150 }}
                                    >
                                      <MenuItem value="todo">À faire</MenuItem>
                                      <MenuItem value="in_progress">En cours</MenuItem>
                                      <MenuItem value="ready_qa">Ready QA</MenuItem>
                                      <MenuItem value="testing">Testing</MenuItem>
                                      <MenuItem value="done">Terminé</MenuItem>
                                    </Select>
                                  </Box>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  );
                })()}
              </>
            ) : (
              <Alert severity="info">Aucune story dans ce sprint</Alert>
            )}

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => handleCompleteSprint(activeSprint._id)}
              >
                Terminer le Sprint
              </Button>
              <Button variant="outlined" startIcon={<BarChart />} onClick={() => setOpenBurndown(true)}>
                Voir Burndown Chart
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Aucun sprint actif. Créez un nouveau sprint ou démarrez-en un existant.
        </Alert>
      )}

      <Typography variant="h5" fontWeight={600} gutterBottom>
        📚 Historique des Sprints
      </Typography>

      <Stack spacing={2}>
        {sprints.filter(s => s.status !== 'active').map((sprint) => (
          <Card key={sprint._id}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {sprint.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(sprint.startDate).toLocaleDateString('fr-FR')} - {new Date(sprint.endDate).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip label={sprint.status} color={sprint.status === 'completed' ? 'success' : 'default'} />
                  {sprint.status === 'planned' && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStartSprint(sprint._id)}
                    >
                      Démarrer
                    </Button>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau Sprint</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Nom du Sprint"
              value={newSprint.name}
              onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
              placeholder="Sprint #1"
            />
            <TextField
              fullWidth
              label="Objectif"
              value={newSprint.goal}
              onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
              multiline
              rows={2}
              placeholder="Objectif principal du sprint..."
            />
            <TextField
              fullWidth
              type="date"
              label="Date de début"
              value={newSprint.startDate}
              onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="date"
              label="Date de fin"
              value={newSprint.endDate}
              onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateSprint}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Burndown Chart */}
      <Dialog open={openBurndown} onClose={() => setOpenBurndown(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">📊 Burndown Chart - {activeSprint?.name}</Typography>
            <IconButton onClick={() => setOpenBurndown(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', height: 400, mt: 2 }}>
            <ResponsiveContainer>
              <LineChart data={generateBurndownData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Stories Restantes', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {payload[0].payload.date}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            Idéal: {payload[0].value} stories
                          </Typography>
                          {payload[1]?.value !== null && (
                            <Typography variant="body2" color="error">
                              Réel: {payload[1].value} stories
                            </Typography>
                          )}
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ideal" 
                  stroke="#1976d2" 
                  name="Burndown Idéal"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#d32f2f" 
                  name="Burndown Réel"
                  strokeWidth={3}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>📈 Analyse</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Stories Totales</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {activeSprint?.metrics?.totalStories || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Stories Complétées</Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {activeSprint?.metrics?.completedStories || 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Stories Restantes</Typography>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {(activeSprint?.metrics?.totalStories || 0) - (activeSprint?.metrics?.completedStories || 0)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBurndown(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sprints;
