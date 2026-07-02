import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchTestCases, deleteTestCase, createTestCase, updateTestCase } from '../store/slices/testcaseSlice';
import { fetchTestPlans, createTestPlan, updateTestPlan, deleteTestPlan } from '../store/slices/testplanSlice';
import { fetchStories } from '../store/slices/storySlice';
import {
  Box, Typography, Chip, IconButton, Table, TableHead, TableRow, TableCell,
  TableBody, CircularProgress, Tooltip, TableContainer, Paper, TextField,
  MenuItem, Accordion, AccordionSummary, AccordionDetails, InputAdornment,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider,
  Alert, Card, CardContent, Autocomplete, Tabs, Tab
} from '@mui/material';
import {
  Delete, SmartToy, ExpandMore, Search, FolderOpen, Add, Edit,
  AddCircleOutline, RemoveCircleOutline, Visibility, Assignment, ArrowBack
} from '@mui/icons-material';
import DetailDialog from '../components/DetailDialog';

const priorityColors: any = { critical: 'error', high: 'warning', medium: 'info', low: 'default' };
const planStatusColors: any = { draft: 'default', active: 'info', completed: 'success', archived: 'warning' };
const planStatusLabels: any = { draft: 'Brouillon', active: 'Actif', completed: 'Terminé', archived: 'Archivé' };

const TestCases: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { testcases, loading: tcLoading } = useSelector((state: RootState) => state.testcases);
  const { testplans, loading: planLoading } = useSelector((state: RootState) => state.testplans);
  const { stories } = useSelector((state: RootState) => state.stories);

  // View state
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Plan dialog
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planEditId, setPlanEditId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({ name: '', description: '', sprint: '', status: 'draft', testCases: [] as string[], userStories: [] as string[] });

  const handlePlanStoriesChange = (selectedStoryIds: string[]) => {
    const prevStoryIds = planForm.userStories;
    const addedIds = selectedStoryIds.filter((id) => !prevStoryIds.includes(id));
    const removedIds = prevStoryIds.filter((id) => !selectedStoryIds.includes(id));

    let newTcIds = [...planForm.testCases];
    // Auto-add AI test cases for newly selected stories
    addedIds.forEach((storyId) => {
      testcases.forEach((tc: any) => {
        if (tc.userStory?._id === storyId && tc.generatedByAI && !newTcIds.includes(tc._id)) {
          newTcIds.push(tc._id);
        }
      });
    });
    // Auto-remove AI test cases for deselected stories (only AI-generated ones)
    removedIds.forEach((storyId) => {
      const aiTcIds = testcases
        .filter((tc: any) => tc.userStory?._id === storyId && tc.generatedByAI)
        .map((tc: any) => tc._id);
      newTcIds = newTcIds.filter((id) => !aiTcIds.includes(id));
    });

    setPlanForm({ ...planForm, userStories: selectedStoryIds, testCases: newTcIds });
  };

  // Test case dialog
  const [tcDialogOpen, setTcDialogOpen] = useState(false);
  const [tcEditId, setTcEditId] = useState<string | null>(null);
  const emptyStep = { stepNumber: 1, action: '', expectedResult: '', testData: '' };
  const [tcForm, setTcForm] = useState({
    title: '', description: '', preconditions: '', priority: 'medium',
    type: 'functional', userStory: '', steps: [{ ...emptyStep }],
  });

  // Detail dialogs
  const [detailTC, setDetailTC] = useState<any>(null);
  const [detailPlan, setDetailPlan] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchTestPlans({}));
    dispatch(fetchTestCases({}));
    dispatch(fetchStories({}));
  }, [dispatch]);

  // ─── Plan handlers ───
  const handleOpenPlanCreate = () => {
    setPlanEditId(null);
    setPlanForm({ name: '', description: '', sprint: '', status: 'draft', testCases: [], userStories: [] });
    setPlanDialogOpen(true);
  };

  const handleOpenPlanEdit = (plan: any) => {
    setPlanEditId(plan._id);
    const tcList = (plan.testCases || []).map((tc: any) => tc._id || tc);
    const storyIds = Array.from(new Set((plan.testCases || []).filter((tc: any) => tc.userStory?._id && tc.generatedByAI).map((tc: any) => tc.userStory._id))) as string[];
    setPlanForm({
      name: plan.name, description: plan.description || '', sprint: plan.sprint || '',
      status: plan.status, testCases: tcList, userStories: storyIds,
    });
    setPlanDialogOpen(true);
  };

  const handleSavePlan = async () => {
    const data = { ...planForm };
    if (planEditId) {
      const r = await dispatch(updateTestPlan({ id: planEditId, data }));
      if (updateTestPlan.fulfilled.match(r)) {
        setSuccessMsg('Plan mis à jour !');
        if (selectedPlan?._id === planEditId) setSelectedPlan(r.payload);
      }
    } else {
      const r = await dispatch(createTestPlan(data));
      if (createTestPlan.fulfilled.match(r)) setSuccessMsg('Plan créé !');
    }
    setPlanDialogOpen(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeletePlan = (id: string) => {
    if (window.confirm('Supprimer ce plan de test ?')) {
      dispatch(deleteTestPlan(id));
      if (selectedPlan?._id === id) setSelectedPlan(null);
    }
  };

  // ─── Test case handlers ───
  const handleOpenTcCreate = () => {
    setTcEditId(null);
    setTcForm({ title: '', description: '', preconditions: '', priority: 'medium', type: 'functional', userStory: '', steps: [{ ...emptyStep }] });
    setTcDialogOpen(true);
  };

  const handleOpenTcEdit = (tc: any) => {
    setTcEditId(tc._id);
    setTcForm({
      title: tc.title || '', description: tc.description || '',
      preconditions: (tc.preconditions || []).join('\n'),
      priority: tc.priority || 'medium', type: tc.type || 'functional',
      userStory: tc.userStory?._id || '',
      steps: tc.steps?.length > 0
        ? tc.steps.map((s: any) => ({ stepNumber: s.stepNumber, action: s.action, expectedResult: s.expectedResult, testData: s.testData || '' }))
        : [{ ...emptyStep }],
    });
    setTcDialogOpen(true);
  };

  const handleAddStep = () => {
    setTcForm((prev) => ({ ...prev, steps: [...prev.steps, { stepNumber: prev.steps.length + 1, action: '', expectedResult: '', testData: '' }] }));
  };
  const handleRemoveStep = (idx: number) => {
    setTcForm((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 })) }));
  };
  const handleStepChange = (idx: number, field: string, value: string) => {
    setTcForm((prev) => ({ ...prev, steps: prev.steps.map((s, i) => i === idx ? { ...s, [field]: value } : s) }));
  };

  const handleSaveTc = async () => {
    const data: any = {
      title: tcForm.title, description: tcForm.description,
      preconditions: tcForm.preconditions.split('\n').map((s) => s.trim()).filter(Boolean),
      priority: tcForm.priority, type: tcForm.type,
      userStory: tcForm.userStory || undefined,
      steps: tcForm.steps.filter((s) => s.action.trim()),
    };
    let result;
    if (tcEditId) {
      result = await dispatch(updateTestCase({ id: tcEditId, data }));
      if (updateTestCase.fulfilled.match(result)) setSuccessMsg('Cas de test mis à jour !');
    } else {
      result = await dispatch(createTestCase(data));
      if (createTestCase.fulfilled.match(result)) {
        setSuccessMsg('Cas de test créé !');
        if (selectedPlan) {
          const newId = result.payload._id;
          const updated = { ...selectedPlan, testCases: [...(selectedPlan.testCases || []), result.payload] };
          await dispatch(updateTestPlan({ id: selectedPlan._id, data: { testCases: [...planForm.testCases || (selectedPlan.testCases || []).map((t: any) => t._id || t), newId] } }));
          dispatch(fetchTestPlans({}));
        }
      }
    }
    setTcDialogOpen(false);
    dispatch(fetchTestCases({}));
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteTc = (id: string) => {
    if (window.confirm('Supprimer ce cas de test ?')) dispatch(deleteTestCase(id));
  };

  // ─── Group test cases by user story for a plan ───
  const groupByStory = (tcs: any[]) => {
    const groups: Record<string, { story: any; tests: any[] }> = {};
    tcs.forEach((tc: any) => {
      const sid = tc.userStory?._id || '__none__';
      if (!groups[sid]) groups[sid] = { story: tc.userStory || null, tests: [] };
      groups[sid].tests.push(tc);
    });
    return Object.values(groups).sort((a, b) => {
      if (!a.story) return 1;
      if (!b.story) return -1;
      return (a.story.title || '').localeCompare(b.story.title || '');
    });
  };

  // ─── Detail fields ───
  const getTcDetailFields = (tc: any) => [
    { label: 'ID', value: tc.testId, type: 'link' as const },
    { label: 'Source', value: tc.generatedByAI ? 'Généré par IA' : 'Manuel', type: 'chip' as const, color: tc.generatedByAI ? 'secondary' : 'default' },
    { label: 'Titre', value: tc.title },
    { label: 'User Story', value: tc.userStory?.title || '—', type: 'link' as const },
    { label: 'Priorité', value: tc.priority, type: 'chip' as const, color: priorityColors[tc.priority] },
    { label: 'Type', value: tc.type, type: 'chip' as const },
    { label: 'Créé par', value: tc.createdBy ? `${tc.createdBy.firstName} ${tc.createdBy.lastName}` : '—' },
    { label: 'Créé le', value: tc.createdAt, type: 'date' as const },
    { label: 'Description', value: tc.description },
    { label: 'Préconditions', value: tc.preconditions, type: 'list' as const },
    { label: 'Étapes', value: tc.steps, type: 'steps' as const },
  ];

  const getPlanDetailFields = (p: any) => [
    { label: 'Nom', value: p.name },
    { label: 'Statut', value: planStatusLabels[p.status] || p.status, type: 'chip' as const, color: planStatusColors[p.status] },
    { label: 'Sprint', value: p.sprint || '—' },
    { label: 'Créé par', value: p.createdBy ? `${p.createdBy.firstName} ${p.createdBy.lastName}` : '—' },
    { label: 'Créé le', value: p.createdAt, type: 'date' as const },
    { label: 'Description', value: p.description },
    { label: 'Cas de test', value: (p.testCases || []).map((tc: any) => tc.testId ? `${tc.testId} — ${tc.title}` : ''), type: 'chips' as const },
  ];

  // ─── Filtered plans ───
  const filteredPlans = useMemo(() => {
    if (!search) return testplans;
    return testplans.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()));
  }, [testplans, search]);

  // ─── RENDER: Plan detail view (selected plan) ───
  if (selectedPlan) {
    const planData = testplans.find((p: any) => p._id === selectedPlan._id) || selectedPlan;
    const planTCs = planData.testCases || [];
    const grouped = groupByStory(planTCs);

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => setSelectedPlan(null)}>Retour</Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>{planData.name}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip label={planStatusLabels[planData.status]} color={planStatusColors[planData.status]} size="small" />
              {planData.sprint && <Chip label={planData.sprint} size="small" variant="outlined" />}
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, alignSelf: 'center' }}>
                {planTCs.length} cas de test · {grouped.length} user stor{grouped.length > 1 ? 'ies' : 'y'}
              </Typography>
            </Box>
          </Box>
          <Button variant="outlined" startIcon={<Edit />} onClick={() => handleOpenPlanEdit(planData)}>Modifier le plan</Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenTcCreate}>Nouveau cas de test</Button>
        </Box>

        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        {planData.description && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: '#f8f9fc' }}>
            <Typography variant="body2" color="text.secondary">{planData.description}</Typography>
          </Paper>
        )}

        {grouped.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">Aucun cas de test dans ce plan. Modifiez le plan pour en ajouter, ou créez-en un nouveau.</Typography>
          </Paper>
        ) : (
          grouped.map((group) => {
            const storyKey = group.story?._id || '__none__';
            return (
              <Accordion key={storyKey} defaultExpanded
                sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' }, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f8f9fc', borderRadius: '8px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <FolderOpen sx={{ color: '#1565c0', fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                      {group.story ? group.story.title : 'Sans User Story'}
                    </Typography>
                    {group.story?.priority && (
                      <Chip label={group.story.priority} size="small" color={priorityColors[group.story.priority]} sx={{ mr: 1 }} />
                    )}
                    <Chip label={`${group.tests.length} test${group.tests.length > 1 ? 's' : ''}`} size="small" variant="outlined" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                          <TableCell sx={{ fontWeight: 700, width: 100 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Titre</TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 100 }}>Priorité</TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 120 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 80 }}>Source</TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 110 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {group.tests.map((tc: any) => (
                          <TableRow key={tc._id} hover>
                            <TableCell><Typography variant="body2" fontFamily="monospace" fontWeight={600}>{tc.testId}</Typography></TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>{tc.title}</Typography>
                              {tc.steps?.length > 0 && <Typography variant="caption" color="text.secondary">{tc.steps.length} étape(s)</Typography>}
                            </TableCell>
                            <TableCell><Chip label={tc.priority} color={priorityColors[tc.priority]} size="small" /></TableCell>
                            <TableCell><Chip label={tc.type} size="small" variant="outlined" /></TableCell>
                            <TableCell>
                              {tc.generatedByAI
                                ? <Tooltip title="Généré par IA"><SmartToy sx={{ fontSize: 18, color: '#7c4dff' }} /></Tooltip>
                                : <Typography variant="caption">Manuel</Typography>}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Détail"><IconButton size="small" color="primary" onClick={() => setDetailTC(tc)}><Visibility fontSize="small" /></IconButton></Tooltip>
                              <Tooltip title="Modifier"><IconButton size="small" onClick={() => handleOpenTcEdit(tc)}><Edit fontSize="small" /></IconButton></Tooltip>
                              <IconButton size="small" color="error" onClick={() => handleDeleteTc(tc._id)}><Delete fontSize="small" /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}

        {/* TC Detail */}
        {detailTC && <DetailDialog open={!!detailTC} onClose={() => setDetailTC(null)} title={`Cas de test : ${detailTC.testId}`} fields={getTcDetailFields(detailTC)} />}

        {/* TC Create/Edit Dialog */}
        {renderTcDialog()}

        {/* Plan Edit Dialog */}
        {renderPlanDialog()}
      </Box>
    );
  }

  // ─── RENDER: Plans list ───
  function renderPlansList() {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Plans de Test</Typography>
            <Typography variant="body2" color="text.secondary">{testplans.length} plan(s)</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenPlanCreate}>Nouveau Plan de Test</Button>
        </Box>

        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <TextField size="small" placeholder="Rechercher un plan..." fullWidth
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
        </Paper>

        {planLoading ? <CircularProgress /> : filteredPlans.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">
              {search ? 'Aucun plan ne correspond à la recherche.' : 'Aucun plan de test. Créez-en un !'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredPlans.map((plan: any) => {
              const tcCount = (plan.testCases || []).length;
              const storyCount = groupByStory(plan.testCases || []).length;
              return (
                <Grid item xs={12} md={6} lg={4} key={plan._id}>
                  <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }, transition: 'box-shadow 0.2s' }}
                    onClick={() => setSelectedPlan(plan)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip label={planStatusLabels[plan.status]} color={planStatusColors[plan.status]} size="small" />
                        {plan.sprint && <Chip label={plan.sprint} size="small" variant="outlined" />}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Assignment sx={{ color: '#1565c0' }} />
                        <Typography variant="h6" fontWeight={600}>{plan.name}</Typography>
                      </Box>
                      {plan.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {plan.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip label={`${tcCount} cas de test`} size="small" variant="outlined" />
                        <Chip label={`${storyCount} user stor${storyCount > 1 ? 'ies' : 'y'}`} size="small" variant="outlined" />
                      </Box>
                      {plan.createdBy && (
                        <Typography variant="caption" color="text.secondary">
                          Par {plan.createdBy.firstName} {plan.createdBy.lastName}
                        </Typography>
                      )}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Détail"><IconButton size="small" color="primary" onClick={() => setDetailPlan(plan)}><Visibility fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Modifier"><IconButton size="small" onClick={() => handleOpenPlanEdit(plan)}><Edit fontSize="small" /></IconButton></Tooltip>
                        <IconButton size="small" color="error" onClick={() => handleDeletePlan(plan._id)}><Delete fontSize="small" /></IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Plan Detail */}
        {detailPlan && <DetailDialog open={!!detailPlan} onClose={() => setDetailPlan(null)} title={`Plan : ${detailPlan.name}`} fields={getPlanDetailFields(detailPlan)} />}

        {/* Plan Create/Edit */}
        {renderPlanDialog()}
      </Box>
    );
  }

  // ─── Plan Dialog ───
  function renderPlanDialog() {
    return (
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{planEditId ? 'Modifier le plan de test' : 'Nouveau plan de test'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nom du plan" value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Sprint" value={planForm.sprint}
                onChange={(e) => setPlanForm({ ...planForm, sprint: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Statut" value={planForm.status}
                onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}>
                {Object.entries(planStatusLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v as string}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete multiple options={stories}
                getOptionLabel={(opt: any) => opt.title}
                value={stories.filter((s: any) => planForm.userStories.includes(s._id))}
                onChange={(_, newVal) => handlePlanStoriesChange(newVal.map((v: any) => v._id))}
                renderInput={(params) => <TextField {...params} label="User Stories (les cas de test IA seront ajoutés automatiquement)" />}
                isOptionEqualToValue={(opt: any, val: any) => opt._id === val._id}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete multiple options={testcases}
                getOptionLabel={(opt: any) => `${opt.testId} — ${opt.title}`}
                value={testcases.filter((tc: any) => planForm.testCases.includes(tc._id))}
                onChange={(_, newVal) => setPlanForm({ ...planForm, testCases: newVal.map((v: any) => v._id) })}
                renderInput={(params) => <TextField {...params} label="Cas de test inclus" helperText="Les cas de test IA sont ajoutés automatiquement via les User Stories. Vous pouvez aussi en ajouter manuellement." />}
                groupBy={(opt: any) => opt.userStory?.title || 'Sans User Story'}
                isOptionEqualToValue={(opt: any, val: any) => opt._id === val._id}
                renderTags={(value: any[], getTagProps) =>
                  value.map((opt: any, index: number) => (
                    <Chip {...getTagProps({ index })} key={opt._id}
                      label={opt.testId || opt.title}
                      size="small"
                      color={opt.generatedByAI ? 'secondary' : 'default'}
                      variant={opt.generatedByAI ? 'filled' : 'outlined'}
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSavePlan} disabled={!planForm.name.trim()}>
            {planEditId ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // ─── TC Dialog ───
  function renderTcDialog() {
    return (
      <Dialog open={tcDialogOpen} onClose={() => setTcDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{tcEditId ? 'Modifier le cas de test' : 'Nouveau cas de test'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Titre" value={tcForm.title}
                onChange={(e) => setTcForm({ ...tcForm, title: e.target.value })} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} value={tcForm.description}
                onChange={(e) => setTcForm({ ...tcForm, description: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="User Story" value={tcForm.userStory}
                onChange={(e) => setTcForm({ ...tcForm, userStory: e.target.value })}>
                <MenuItem value="">Aucune</MenuItem>
                {stories.map((s: any) => <MenuItem key={s._id} value={s._id}>{s.title}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth select label="Priorité" value={tcForm.priority}
                onChange={(e) => setTcForm({ ...tcForm, priority: e.target.value })}>
                <MenuItem value="critical">Critique</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="low">Basse</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth select label="Type" value={tcForm.type}
                onChange={(e) => setTcForm({ ...tcForm, type: e.target.value })}>
                <MenuItem value="functional">Fonctionnel</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
                <MenuItem value="security">Sécurité</MenuItem>
                <MenuItem value="usability">Utilisabilité</MenuItem>
                <MenuItem value="regression">Régression</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Préconditions" multiline rows={2} value={tcForm.preconditions}
                onChange={(e) => setTcForm({ ...tcForm, preconditions: e.target.value })}
                helperText="Une par ligne" />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>Étapes du test</Typography>
                <Button size="small" startIcon={<AddCircleOutline />} onClick={handleAddStep}>Ajouter une étape</Button>
              </Box>
              {tcForm.steps.map((step, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip label={`#${idx + 1}`} size="small" color="primary" />
                    {tcForm.steps.length > 1 && (
                      <IconButton size="small" color="error" onClick={() => handleRemoveStep(idx)}>
                        <RemoveCircleOutline fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <TextField fullWidth size="small" label="Action" value={step.action}
                        onChange={(e) => handleStepChange(idx, 'action', e.target.value)} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField fullWidth size="small" label="Résultat attendu" value={step.expectedResult}
                        onChange={(e) => handleStepChange(idx, 'expectedResult', e.target.value)} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField fullWidth size="small" label="Données de test" value={step.testData}
                        onChange={(e) => handleStepChange(idx, 'testData', e.target.value)} />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTcDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveTc} disabled={!tcForm.title.trim()}>
            {tcEditId ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return renderPlansList();
};

export default TestCases;
