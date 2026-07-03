import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Chip, IconButton,
  CircularProgress, Alert, Divider, Stack, Paper, Grid
} from '@mui/material';
import {
  ArrowBack, Add, BugReport, Edit, CheckCircle, Link as LinkIcon
} from '@mui/icons-material';
import api from '../services/api';

interface Bug {
  _id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  classification: string;
  createdBy?: { firstName: string; lastName: string };
  assignedTo?: { firstName: string; lastName: string };
  testCase?: { title: string };
  createdAt: string;
  updatedAt: string;
}

interface Story {
  _id: string;
  title: string;
  description: string;
  priority: string;
}

const StoryBugs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [story, setStory] = useState<Story | null>(null);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/stories/${id}/bugs`);
      setStory(response.data.story);
      setBugs(response.data.bugs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[severity] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      open: 'error',
      assigned: 'warning',
      in_progress: 'info',
      fixed: 'success',
      closed: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      open: 'Ouvert',
      assigned: 'Assigné',
      in_progress: 'En cours',
      fixed: 'Résolu',
      closed: 'Fermé'
    };
    return labels[status] || status;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days}j`;
    return d.toLocaleDateString('fr-FR');
  };

  const getBugStats = () => {
    const total = bugs.length;
    const open = bugs.filter(b => b.status === 'open').length;
    const inProgress = bugs.filter(b => b.status === 'in_progress').length;
    const fixed = bugs.filter(b => b.status === 'fixed').length;
    
    return { total, open, inProgress, fixed };
  };

  const stats = getBugStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!story) {
    return <Alert severity="error">User Story non trouvée</Alert>;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/stories')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          🐛 Bugs - Story #{story._id?.slice(-4)}: {story.title}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📝 User Story
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <Chip label={`Priorité: ${story.priority}`} color="primary" size="small" />
          </Box>
          <Typography variant="body1" color="text.secondary">
            {story.description}
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          🐛 Bugs ({bugs.length})
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Signaler un bug
        </Button>
      </Box>

      {bugs.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📊 Statistiques
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">Total</Typography>
              <Typography variant="h5" fontWeight={700}>{stats.total}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">Ouverts</Typography>
              <Typography variant="h5" fontWeight={700} color="error.main">
                {stats.open} ({stats.total > 0 ? Math.round((stats.open / stats.total) * 100) : 0}%)
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">En cours</Typography>
              <Typography variant="h5" fontWeight={700} color="info.main">
                {stats.inProgress} ({stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%)
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">Résolus</Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {stats.fixed} ({stats.total > 0 ? Math.round((stats.fixed / stats.total) * 100) : 0}%)
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {bugs.length === 0 ? (
        <Alert severity="info">
          Aucun bug signalé pour cette story. Cliquez sur "Signaler un bug" pour en ajouter un.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {bugs.map((bug) => (
            <Card key={bug._id}>
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <BugReport color={getSeverityColor(bug.severity)} />
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {bug.title}
                    </Typography>
                    
                    <Box display="flex" gap={1} mb={2}>
                      <Chip
                        label={`Sévérité: ${bug.severity}`}
                        color={getSeverityColor(bug.severity)}
                        size="small"
                      />
                      <Chip
                        label={getStatusLabel(bug.status)}
                        color={getStatusColor(bug.status)}
                        size="small"
                      />
                      {bug.assignedTo && (
                        <Chip
                          label={`Assigné: ${bug.assignedTo.firstName} ${bug.assignedTo.lastName}`}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      Créé le: {formatDate(bug.createdAt)} | Mis à jour: {formatDate(bug.updatedAt)}
                    </Typography>

                    <Typography variant="body1" paragraph>
                      {bug.description}
                    </Typography>

                    {bug.testCase && (
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <LinkIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Test Case lié: {bug.testCase.title}
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" gap={1}>
                      <Button size="small" startIcon={<Edit />}>
                        Modifier
                      </Button>
                      <Button size="small" color="success" startIcon={<CheckCircle />}>
                        Résoudre
                      </Button>
                      <Button size="small" startIcon={<LinkIcon />}>
                        Lier Test
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default StoryBugs;
