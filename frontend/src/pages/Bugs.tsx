import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchBugs, createBug, updateBug, deleteBug } from '../store/slices/bugSlice';
import { fetchUsers } from '../store/slices/authSlice';
import { fetchTestCases } from '../store/slices/testcaseSlice';
import {
  Box, Typography, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Grid, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import DetailDialog from '../components/DetailDialog';

const severityColors: any = { critical: 'error', high: 'warning', medium: 'info', low: 'default' };
const statusColors: any = { open: 'error', assigned: 'warning', in_progress: 'info', fixed: 'success', closed: 'default' };
const statusLabels: any = { open: 'Ouvert', assigned: 'Assigné', in_progress: 'En cours', fixed: 'Corrigé', closed: 'Fermé' };
const classLabels: any = { functional: 'Fonctionnel', performance: 'Performance', security: 'Sécurité', ux_ui: 'UX/UI', regression: 'Régression', unclassified: 'Non classé' };

const Bugs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bugs, loading, total } = useSelector((state: RootState) => state.bugs);
  const { users } = useSelector((state: RootState) => state.auth);
  const { testcases } = useSelector((state: RootState) => state.testcases);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailBug, setDetailBug] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', severity: 'medium', priority: 'medium',
    status: 'open', assignedTo: '', testCase: '',
  });

  useEffect(() => {
    const params: any = {};
    if (statusFilter) params.status = statusFilter;
    if (severityFilter) params.severity = severityFilter;
    dispatch(fetchBugs(params));
    dispatch(fetchUsers());
    dispatch(fetchTestCases({}));
  }, [dispatch, statusFilter, severityFilter]);

  const handleOpen = (bug?: any) => {
    if (bug) {
      setEditId(bug._id);
      setForm({
        title: bug.title, description: bug.description,
        severity: bug.severity, priority: bug.priority,
        status: bug.status, assignedTo: bug.assignedTo?._id || '',
        testCase: bug.testCase?._id || bug.testCase || '',
      });
    } else {
      setEditId(null);
      setForm({ title: '', description: '', severity: 'medium', priority: 'medium', status: 'open', assignedTo: '', testCase: '' });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const data = { ...form, assignedTo: form.assignedTo || undefined, testCase: form.testCase || undefined };
    if (editId) await dispatch(updateBug({ id: editId, data }));
    else await dispatch(createBug(data));
    setOpen(false);
    dispatch(fetchBugs({}));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer ce bug ?')) dispatch(deleteBug(id));
  };

  const getDetailFields = (bug: any) => [
    { label: 'Titre', value: bug.title },
    { label: 'Statut', value: statusLabels[bug.status] || bug.status, type: 'chip' as const, color: statusColors[bug.status] },
    { label: 'Sévérité', value: bug.severity, type: 'chip' as const, color: severityColors[bug.severity] },
    { label: 'Priorité', value: bug.priority, type: 'chip' as const },
    { label: 'Classification IA', value: bug.classification ? (classLabels[bug.classification] || bug.classification) : '—', type: 'chip' as const, color: 'secondary' },
    { label: 'Confiance IA', value: bug.classificationConfidence ? `${bug.classificationConfidence}%` : '—' },
    { label: 'Cas de test lié', value: bug.testCase ? `${bug.testCase.testId || ''} — ${bug.testCase.title || bug.testCase}` : '—', type: 'link' as const },
    { label: 'Assigné à', value: bug.assignedTo ? `${bug.assignedTo.firstName} ${bug.assignedTo.lastName}` : '—' },
    { label: 'Créé par', value: bug.createdBy ? `${bug.createdBy.firstName} ${bug.createdBy.lastName}` : '—' },
    { label: 'Créé le', value: bug.createdAt, type: 'date' as const },
    { label: 'Description', value: bug.description },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Gestion des Bugs</Typography>
          <Typography variant="body2" color="text.secondary">{total} bug(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nouveau Bug</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField select label="Statut" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }} size="small">
          <MenuItem value="">Tous</MenuItem>
          {Object.entries(statusLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v as string}</MenuItem>)}
        </TextField>
        <TextField select label="Sévérité" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
          sx={{ minWidth: 150 }} size="small">
          <MenuItem value="">Toutes</MenuItem>
          {['critical', 'high', 'medium', 'low'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
      </Box>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 700 }}>Titre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sévérité</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Classification IA</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cas de test</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigné à</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bugs.map((bug: any) => (
                <TableRow key={bug._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{bug.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {bug.description}
                    </Typography>
                  </TableCell>
                  <TableCell><Chip label={bug.severity} color={severityColors[bug.severity]} size="small" /></TableCell>
                  <TableCell><Chip label={statusLabels[bug.status] || bug.status} color={statusColors[bug.status]} size="small" /></TableCell>
                  <TableCell>
                    {bug.classification && bug.classification !== 'unclassified' ? (
                      <Tooltip title={`Confiance: ${bug.classificationConfidence || 0}%`}>
                        <Chip label={classLabels[bug.classification] || bug.classification} size="small" variant="outlined" color="secondary" />
                      </Tooltip>
                    ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                  </TableCell>
                  <TableCell>
                    {bug.testCase ? (
                      <Chip label={bug.testCase.testId || 'Lié'} size="small" color="primary" variant="outlined" />
                    ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {bug.assignedTo ? `${bug.assignedTo.firstName} ${bug.assignedTo.lastName}` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{new Date(bug.createdAt).toLocaleDateString('fr-FR')}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Détail"><IconButton size="small" color="primary" onClick={() => setDetailBug(bug)}><Visibility fontSize="small" /></IconButton></Tooltip>
                    <IconButton size="small" onClick={() => handleOpen(bug)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(bug._id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {bugs.length === 0 && (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  Aucun bug enregistré.
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      {detailBug && (
        <DetailDialog open={!!detailBug} onClose={() => setDetailBug(null)}
          title={`Bug : ${detailBug.title}`} fields={getDetailFields(detailBug)} />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Modifier' : 'Nouveau'} Bug</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={4} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} required
                helperText="Décrivez le bug en détail. L'IA le classifiera automatiquement." />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth select label="Sévérité" value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                {['critical', 'high', 'medium', 'low'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth select label="Priorité" value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {['critical', 'high', 'medium', 'low'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth select label="Statut" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(statusLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v as string}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Cas de test lié" value={form.testCase}
                onChange={(e) => setForm({ ...form, testCase: e.target.value })}>
                <MenuItem value="">Aucun</MenuItem>
                {testcases.map((tc: any) => <MenuItem key={tc._id} value={tc._id}>{tc.testId} — {tc.title}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Assigné à" value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <MenuItem value="">Non assigné</MenuItem>
                {users.map((u: any) => <MenuItem key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role})</MenuItem>)}
              </TextField>
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

export default Bugs;
