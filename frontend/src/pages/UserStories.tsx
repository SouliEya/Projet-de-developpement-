import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchStories, createStory, updateStory, deleteStory } from '../store/slices/storySlice';
import { generateTestCases } from '../store/slices/testcaseSlice';
import {
  Box, Typography, Button, Card, CardContent, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid, CircularProgress, Alert, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Science, AutoAwesome, Visibility } from '@mui/icons-material';
import DetailDialog from '../components/DetailDialog';

const priorityColors: any = { critical: 'error', high: 'warning', medium: 'info', low: 'default' };
const statusColors: any = { draft: 'default', ready: 'info', in_progress: 'warning', done: 'success' };

const UserStories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stories, loading } = useSelector((state: RootState) => state.stories);
  const { generating } = useSelector((state: RootState) => state.testcases);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', sprint: '', status: 'draft', acceptanceCriteria: '' });
  const [genSuccess, setGenSuccess] = useState('');
  const [detailStory, setDetailStory] = useState<any>(null);

  const getDetailFields = (s: any) => [
    { label: 'Titre', value: s.title },
    { label: 'Statut', value: s.status, type: 'chip' as const, color: statusColors[s.status] },
    { label: 'Priorité', value: s.priority, type: 'chip' as const, color: priorityColors[s.priority] },
    { label: 'Sprint', value: s.sprint || '—' },
    { label: 'Projet', value: s.project || '—' },
    { label: 'Créé par', value: s.createdBy ? `${s.createdBy.firstName} ${s.createdBy.lastName}` : '—' },
    { label: 'Créé le', value: s.createdAt, type: 'date' as const },
    { label: 'Description', value: s.description },
    { label: "Critères d'acceptation", value: s.acceptanceCriteria, type: 'list' as const },
  ];

  useEffect(() => { dispatch(fetchStories({})); }, [dispatch]);

  const handleOpen = (story?: any) => {
    if (story) {
      setEditId(story._id);
      setForm({
        title: story.title, description: story.description, priority: story.priority,
        sprint: story.sprint || '', status: story.status,
        acceptanceCriteria: (story.acceptanceCriteria || []).join('\n')
      });
    } else {
      setEditId(null);
      setForm({ title: '', description: '', priority: 'medium', sprint: '', status: 'draft', acceptanceCriteria: '' });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const data = {
      ...form,
      acceptanceCriteria: form.acceptanceCriteria.split('\n').filter(Boolean)
    };
    if (editId) await dispatch(updateStory({ id: editId, data }));
    else await dispatch(createStory(data));
    setOpen(false);
    dispatch(fetchStories({}));
  };

  const handleGenerate = async (storyId: string) => {
    const result = await dispatch(generateTestCases(storyId));
    if (generateTestCases.fulfilled.match(result)) {
      setGenSuccess(`${result.payload.count} cas de test générés !`);
      setTimeout(() => setGenSuccess(''), 4000);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer cette User Story ?')) dispatch(deleteStory(id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>User Stories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nouvelle Story</Button>
      </Box>

      {genSuccess && <Alert severity="success" sx={{ mb: 2 }}>{genSuccess}</Alert>}

      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {stories.map((story: any) => (
            <Grid item xs={12} md={6} lg={4} key={story._id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={story.status} color={statusColors[story.status]} size="small" />
                    <Chip label={story.priority} color={priorityColors[story.priority]} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>{story.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {story.description}
                  </Typography>
                  {story.sprint && <Chip label={story.sprint} size="small" sx={{ mb: 1 }} />}
                  {story.acceptanceCriteria?.length > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block">{story.acceptanceCriteria.length} critère(s) d'acceptation</Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Tooltip title="Générer les cas de test (IA)">
                      <Button size="small" variant="outlined" startIcon={generating ? <CircularProgress size={16} /> : <AutoAwesome />}
                        onClick={() => handleGenerate(story._id)} disabled={generating}>
                        Générer Tests
                      </Button>
                    </Tooltip>
                    <Tooltip title="Détail"><IconButton size="small" color="primary" onClick={() => setDetailStory(story)}><Visibility fontSize="small" /></IconButton></Tooltip>
                    <IconButton size="small" onClick={() => handleOpen(story)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(story._id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {detailStory && (
        <DetailDialog open={!!detailStory} onClose={() => setDetailStory(null)}
          title={`User Story : ${detailStory.title}`} fields={getDetailFields(detailStory)} />
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Modifier' : 'Nouvelle'} User Story</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required
                placeholder="En tant que [rôle], je souhaite [action] afin de [bénéfice]" />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth select label="Priorité" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {['low', 'medium', 'high', 'critical'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth select label="Statut" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['draft', 'ready', 'in_progress', 'done'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Sprint" value={form.sprint} onChange={(e) => setForm({ ...form, sprint: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Critères d'acceptation" multiline rows={4} value={form.acceptanceCriteria}
                onChange={(e) => setForm({ ...form, acceptanceCriteria: e.target.value })}
                placeholder="Un critère par ligne" helperText="Un critère par ligne" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>Sauvegarder</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserStories;
