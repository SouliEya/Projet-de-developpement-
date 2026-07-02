import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../store/slices/campaignSlice';
import { fetchTestCases } from '../store/slices/testcaseSlice';
import { fetchUsers } from '../store/slices/authSlice';
import {
  Box, Typography, Button, Card, CardContent, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Grid, CircularProgress,
  LinearProgress, Autocomplete, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, PlayArrow, Visibility } from '@mui/icons-material';
import DetailDialog from '../components/DetailDialog';

const statusColors: any = { planned: 'info', in_progress: 'warning', completed: 'success', cancelled: 'default' };
const statusLabels: any = { planned: 'Planifiée', in_progress: 'En cours', completed: 'Terminée', cancelled: 'Annulée' };

const Campaigns: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { campaigns, loading } = useSelector((state: RootState) => state.campaigns);
  const { testcases } = useSelector((state: RootState) => state.testcases);
  const { users } = useSelector((state: RootState) => state.auth);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailCampaign, setDetailCampaign] = useState<any>(null);

  const getDetailFields = (c: any) => [
    { label: 'Nom', value: c.name },
    { label: 'Statut', value: statusLabels[c.status] || c.status, type: 'chip' as const, color: statusColors[c.status] },
    { label: 'Sprint', value: c.sprint || '—' },
    { label: 'Créé par', value: c.createdBy ? `${c.createdBy.firstName} ${c.createdBy.lastName}` : '—' },
    { label: 'Date début', value: c.startDate, type: 'date' as const },
    { label: 'Date fin', value: c.endDate, type: 'date' as const },
    { label: 'Description', value: c.description },
    { label: 'Cas de test', value: (c.testCases || []).map((tc: any) => tc.testId ? `${tc.testId} — ${tc.title}` : tc.title || tc), type: 'chips' as const },
    { label: 'Assignés', value: (c.assignedTo || []).map((u: any) => u.firstName ? `${u.firstName} ${u.lastName}` : u), type: 'chips' as const },
  ];
  const [form, setForm] = useState({
    name: '', description: '', sprint: '', startDate: '', endDate: '',
    status: 'planned', testCases: [] as string[], assignedTo: [] as string[],
  });

  useEffect(() => {
    dispatch(fetchCampaigns({}));
    dispatch(fetchTestCases({}));
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpen = (campaign?: any) => {
    if (campaign) {
      setEditId(campaign._id);
      setForm({
        name: campaign.name, description: campaign.description || '',
        sprint: campaign.sprint || '',
        startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
        endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
        status: campaign.status,
        testCases: (campaign.testCases || []).map((tc: any) => tc._id || tc),
        assignedTo: (campaign.assignedTo || []).map((u: any) => u._id || u),
      });
    } else {
      setEditId(null);
      setForm({ name: '', description: '', sprint: '', startDate: '', endDate: '', status: 'planned', testCases: [], assignedTo: [] });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const data = {
      ...form,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    if (editId) await dispatch(updateCampaign({ id: editId, data }));
    else await dispatch(createCampaign(data));
    setOpen(false);
    dispatch(fetchCampaigns({}));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer cette campagne ?')) dispatch(deleteCampaign(id));
  };

  const getProgress = (campaign: any) => {
    const tcs = campaign.testCases || [];
    if (tcs.length === 0) return 0;
    return Math.round((tcs.filter((tc: any) => tc.status === 'passed').length / tcs.length) * 100);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Campagnes de Test</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nouvelle Campagne</Button>
      </Box>

      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {campaigns.map((campaign: any) => (
            <Grid item xs={12} md={6} lg={4} key={campaign._id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={statusLabels[campaign.status] || campaign.status} color={statusColors[campaign.status]} size="small" />
                    {campaign.sprint && <Chip label={campaign.sprint} size="small" variant="outlined" />}
                  </Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>{campaign.name}</Typography>
                  {campaign.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {campaign.description}
                    </Typography>
                  )}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {(campaign.testCases || []).length} cas de test · {(campaign.assignedTo || []).length} assigné(s)
                    </Typography>
                  </Box>
                  {campaign.startDate && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(campaign.startDate).toLocaleDateString('fr-FR')}
                      {campaign.endDate && ` → ${new Date(campaign.endDate).toLocaleDateString('fr-FR')}`}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Tooltip title="Détail"><IconButton size="small" color="primary" onClick={() => setDetailCampaign(campaign)}><Visibility fontSize="small" /></IconButton></Tooltip>
                    <IconButton size="small" onClick={() => handleOpen(campaign)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(campaign._id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {campaigns.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>Aucune campagne de test. Créez-en une !</Typography>
            </Grid>
          )}
        </Grid>
      )}

      {detailCampaign && (
        <DetailDialog open={!!detailCampaign} onClose={() => setDetailCampaign(null)}
          title={`Campagne : ${detailCampaign.name}`} fields={getDetailFields(detailCampaign)} />
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Modifier' : 'Nouvelle'} Campagne</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Sprint" value={form.sprint} onChange={(e) => setForm({ ...form, sprint: e.target.value })} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="date" label="Date début" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="date" label="Date fin" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Statut" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(statusLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v as string}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={testcases}
                getOptionLabel={(opt: any) => `${opt.testId} — ${opt.title}`}
                value={testcases.filter((tc: any) => form.testCases.includes(tc._id))}
                onChange={(_, newVal) => setForm({ ...form, testCases: newVal.map((v: any) => v._id) })}
                renderInput={(params) => <TextField {...params} label="Cas de test associés" />}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(opt: any) => `${opt.firstName} ${opt.lastName} (${opt.role})`}
                value={users.filter((u: any) => form.assignedTo.includes(u._id))}
                onChange={(_, newVal) => setForm({ ...form, assignedTo: newVal.map((v: any) => v._id) })}
                renderInput={(params) => <TextField {...params} label="Assigné à" />}
              />
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

export default Campaigns;
