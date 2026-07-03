import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Chip, IconButton,
  CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails,
  TextField, MenuItem, Stack, Divider
} from '@mui/material';
import {
  Add, ExpandMore, Edit, Visibility, ArrowForward, DragIndicator
} from '@mui/icons-material';
import api from '../services/api';
import AddToSprintDialog from '../components/AddToSprintDialog';

interface Story {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  sprint?: string;
  createdBy?: { firstName: string; lastName: string };
}

const Backlog: React.FC = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    sprint: 'all'
  });
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [selectedStoryForSprint, setSelectedStoryForSprint] = useState<{ id: string; title: string } | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stories');
      setStories(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSprintDialog = (storyId: string, storyTitle: string) => {
    setSelectedStoryForSprint({ id: storyId, title: storyTitle });
    setSprintDialogOpen(true);
  };

  const handleSprintSuccess = () => {
    setSuccess('Story ajoutée au sprint avec succès !');
    setTimeout(() => setSuccess(''), 4000);
    fetchStories();
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[priority] || 'default';
  };

  const getPriorityIcon = (priority: string) => {
    const icons: any = {
      critical: '🔴',
      high: '🟡',
      medium: '🟢',
      low: '🔵'
    };
    return icons[priority] || '⚪';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: any = {
      critical: 'Priorité Critique',
      high: 'Priorité Haute',
      medium: 'Priorité Moyenne',
      low: 'Priorité Basse'
    };
    return labels[priority] || priority;
  };

  const groupByPriority = () => {
    const filtered = stories.filter(story => {
      if (filters.priority !== 'all' && story.priority !== filters.priority) return false;
      if (filters.status !== 'all' && story.status !== filters.status) return false;
      if (filters.sprint !== 'all') {
        if (filters.sprint === 'none' && story.sprint) return false;
        if (filters.sprint !== 'none' && story.sprint !== filters.sprint) return false;
      }
      return true;
    });

    const grouped: any = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    filtered.forEach(story => {
      if (grouped[story.priority]) {
        grouped[story.priority].push(story);
      }
    });

    return grouped;
  };

  const groupedStories = groupByPriority();

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
          📋 Product Backlog
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/stories')}>
          Nouvelle Story
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select
              label="Priorité"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Toutes</MenuItem>
              <MenuItem value="critical">Critique</MenuItem>
              <MenuItem value="high">Haute</MenuItem>
              <MenuItem value="medium">Moyenne</MenuItem>
              <MenuItem value="low">Basse</MenuItem>
            </TextField>

            <TextField
              select
              label="Statut"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="draft">Brouillon</MenuItem>
              <MenuItem value="ready">Prêt</MenuItem>
              <MenuItem value="in_progress">En cours</MenuItem>
              <MenuItem value="done">Terminé</MenuItem>
            </TextField>

            <TextField
              select
              label="Sprint"
              value={filters.sprint}
              onChange={(e) => setFilters({ ...filters, sprint: e.target.value })}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="none">Sans sprint</MenuItem>
            </TextField>

            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              {stories.length} stories au total
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {(['critical', 'high', 'medium', 'low'] as const).map((priority) => {
          const priorityStories = groupedStories[priority];
          if (priorityStories.length === 0) return null;

          return (
            <Accordion key={priority} defaultExpanded={priority === 'critical' || priority === 'high'}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" fontWeight={600}>
                    {getPriorityIcon(priority)} {getPriorityLabel(priority)} ({priorityStories.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {priorityStories.map((story: Story) => (
                    <Card key={story._id} sx={{ '&:hover': { boxShadow: 3 } }}>
                      <CardContent>
                        <Box display="flex" alignItems="flex-start" gap={2}>
                          <DragIndicator sx={{ color: 'text.disabled', cursor: 'grab' }} />
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="h6" fontWeight={600}>
                                #{story._id.slice(-4)} {getPriorityIcon(story.priority)} {story.title}
                              </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" paragraph>
                              {story.description.substring(0, 150)}
                              {story.description.length > 150 && '...'}
                            </Typography>

                            <Box display="flex" gap={1} mb={2}>
                              <Chip
                                label={story.priority}
                                color={getPriorityColor(story.priority)}
                                size="small"
                              />
                              <Chip label={story.status} size="small" variant="outlined" />
                              {story.sprint && (
                                <Chip label={`Sprint: ${story.sprint}`} size="small" color="primary" />
                              )}
                              {story.createdBy && (
                                <Chip
                                  label={`Assigné: @${story.createdBy.firstName}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>

                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Visibility />}
                                onClick={() => navigate('/stories')}
                              >
                                Détails
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => navigate('/stories')}
                              >
                                Modifier
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<ArrowForward />}
                                onClick={() => handleOpenSprintDialog(story._id, story.title)}
                              >
                                Ajouter au Sprint
                              </Button>
                            </Stack>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>

      {stories.length === 0 && (
        <Alert severity="info">
          Aucune story dans le backlog. Créez-en une pour commencer.
        </Alert>
      )}

      {selectedStoryForSprint && (
        <AddToSprintDialog
          open={sprintDialogOpen}
          onClose={() => {
            setSprintDialogOpen(false);
            setSelectedStoryForSprint(null);
          }}
          storyId={selectedStoryForSprint.id}
          storyTitle={selectedStoryForSprint.title}
          onSuccess={handleSprintSuccess}
        />
      )}
    </Box>
  );
};

export default Backlog;
