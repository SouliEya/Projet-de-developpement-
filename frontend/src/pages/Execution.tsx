import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchExecutions, runExecution } from '../store/slices/executionSlice';
import { fetchTestCases } from '../store/slices/testcaseSlice';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Alert, FormControlLabel, Checkbox, IconButton
} from '@mui/material';
import { PlayArrow, Add, Edit } from '@mui/icons-material';

const statusColors: any = { passed: 'success', failed: 'error', blocked: 'warning', skipped: 'default', not_run: 'info' };
const statusLabels: any = { passed: 'Passé', failed: 'Échoué', blocked: 'Bloqué', skipped: 'Ignoré', not_run: 'Non exécuté' };

const Execution: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { executions, loading, total } = useSelector((state: RootState) => state.executions);
  const { testcases } = useSelector((state: RootState) => state.testcases);
  const { campaigns } = useSelector((state: RootState) => state.campaigns);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    testCase: '', campaign: '', status: 'not_run', comment: '', duration: '',
    autoCreateBug: false,
  });

  useEffect(() => {
    dispatch(fetchExecutions({}));
    dispatch(fetchTestCases({}));
    dispatch(fetchCampaigns({}));
  }, [dispatch]);

  const handleEdit = (exec: any) => {
    setEditId(exec._id);
    setForm({
      testCase: exec.testCase?._id || '',
      campaign: exec.campaign?._id || '',
      status: exec.status,
      comment: exec.comment || '',
      duration: exec.duration?.toString() || '',
      autoCreateBug: false,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      ...form,
      duration: form.duration ? Number(form.duration) : undefined,
      campaign: form.campaign || undefined,
    };
    
    if (editId) {
      // Mise à jour d'une exécution existante
      try {
        await fetch(`http://localhost:5000/api/executions/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        });
        setSuccess('Exécution mise à jour !');
        setTimeout(() => setSuccess(''), 3000);
        setOpen(false);
        setEditId(null);
        setForm({ testCase: '', campaign: '', status: 'not_run', comment: '', duration: '', autoCreateBug: false });
        dispatch(fetchExecutions({}));
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
      }
    } else {
      // Création d'une nouvelle exécution
      const result = await dispatch(runExecution(data));
      if (runExecution.fulfilled.match(result)) {
        setSuccess('Exécution enregistrée !');
        setTimeout(() => setSuccess(''), 3000);
        setOpen(false);
        setForm({ testCase: '', campaign: '', status: 'not_run', comment: '', duration: '', autoCreateBug: false });
        dispatch(fetchExecutions({}));
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm({ testCase: '', campaign: '', status: 'not_run', comment: '', duration: '', autoCreateBug: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Exécution des Tests</Typography>
          <Typography variant="body2" color="text.secondary">{total} exécution(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<PlayArrow />} onClick={() => setOpen(true)}>Nouvelle Exécution</Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 700 }}>Cas de Test</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Campagne</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Exécuté par</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Durée (min)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Commentaire</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executions.map((exec: any) => (
                <TableRow key={exec._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {exec.testCase?.testId} — {exec.testCase?.title || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{exec.campaign?.name || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={statusLabels[exec.status] || exec.status} color={statusColors[exec.status]} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{exec.executedBy?.firstName} {exec.executedBy?.lastName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{exec.duration || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{new Date(exec.executedAt).toLocaleString('fr-FR')}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exec.comment || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(exec)} color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {executions.length === 0 && (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  Aucune exécution enregistrée.
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Modifier l\'Exécution' : 'Nouvelle Exécution'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField fullWidth select label="Cas de Test" value={form.testCase}
            onChange={(e) => setForm({ ...form, testCase: e.target.value })} required sx={{ mb: 2 }}
            disabled={!!editId}>
            {testcases.map((tc: any) => (
              <MenuItem key={tc._id} value={tc._id}>{tc.testId} — {tc.title}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth select label="Campagne (optionnel)" value={form.campaign}
            onChange={(e) => setForm({ ...form, campaign: e.target.value })} sx={{ mb: 2 }}>
            <MenuItem value="">Aucune</MenuItem>
            {campaigns.map((c: any) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Résultat" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })} sx={{ mb: 2 }}>
            {Object.entries(statusLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v as string}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Durée (minutes)" type="number" value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Commentaire" multiline rows={3} value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })} sx={{ mb: 2 }} />
          {form.status === 'failed' && (
            <FormControlLabel
              control={<Checkbox checked={form.autoCreateBug} onChange={(e) => setForm({ ...form, autoCreateBug: e.target.checked })} />}
              label="Créer automatiquement un bug"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.testCase}>
            {editId ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Execution;
