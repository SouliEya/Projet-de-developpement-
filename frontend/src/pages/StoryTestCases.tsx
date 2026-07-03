import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Chip, IconButton,
  CircularProgress, Alert, Divider, Accordion, AccordionSummary,
  AccordionDetails, Stack, Paper
} from '@mui/material';
import {
  ArrowBack, AutoAwesome, Add, Edit, Delete, ExpandMore,
  CheckCircle, RadioButtonUnchecked, Science
} from '@mui/icons-material';
import api from '../services/api';

interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
  testData?: string;
}

interface TestCase {
  _id?: string;
  title: string;
  description: string;
  preconditions: string[];
  steps: TestStep[];
  priority: string;
  type: string;
  generatedByAI?: boolean;
}

interface Story {
  _id: string;
  title: string;
  description: string;
  acceptanceCriteria?: string[];
  priority: string;
}

const StoryTestCases: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [story, setStory] = useState<Story | null>(null);
  const [tests, setTests] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/stories/${id}/tests`);
      setStory(response.data.story);
      setTests(response.data.tests);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    try {
      setGenerating(true);
      setError('');
      const response = await api.post(`/stories/${id}/generate-tests`);
      setTests([...response.data.testCases, ...tests]);
      alert(`${response.data.count} cas de test générés avec succès !`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
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

  const getTypeIcon = (type: string) => {
    return <Science fontSize="small" />;
  };

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
          🧪 Cas de Test - Story #{story._id?.slice(-4)}: {story.title}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📝 User Story
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <Chip label={`Priorité: ${story.priority}`} color={getPriorityColor(story.priority)} size="small" />
          </Box>
          <Typography variant="body1" color="text.secondary" paragraph>
            {story.description}
          </Typography>
          
          {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
            <>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Critères d'acceptation:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {story.acceptanceCriteria.map((criteria, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{criteria}</Typography>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🤖 Génération Automatique de Tests
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Générez automatiquement des cas de test avec l'IA basés sur la description et les critères d'acceptation
        </Typography>
        <Button
          variant="contained"
          startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
          onClick={handleGenerateTests}
          disabled={generating}
        >
          {generating ? 'Génération en cours...' : 'Générer des tests avec l\'IA'}
        </Button>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          📋 Cas de Test ({tests.length})
        </Typography>
        <Button variant="outlined" startIcon={<Add />}>
          Ajouter manuellement
        </Button>
      </Box>

      {tests.length === 0 ? (
        <Alert severity="info">
          Aucun cas de test pour cette story. Utilisez la génération IA ou ajoutez-en manuellement.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {tests.map((test, index) => (
            <Accordion key={test._id || index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  {test.generatedByAI ? (
                    <AutoAwesome fontSize="small" color="primary" />
                  ) : (
                    <Edit fontSize="small" color="action" />
                  )}
                  <Typography fontWeight={600} flex={1}>
                    {test.title}
                  </Typography>
                  <Chip
                    label={test.priority}
                    color={getPriorityColor(test.priority)}
                    size="small"
                  />
                  <Chip
                    label={test.type}
                    variant="outlined"
                    size="small"
                  />
                  {test.generatedByAI && (
                    <Chip
                      label="🤖 Généré par IA"
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {test.description}
                  </Typography>

                  {test.preconditions && test.preconditions.length > 0 && (
                    <>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Préconditions:
                      </Typography>
                      <ul style={{ margin: '0 0 16px 0', paddingLeft: 20 }}>
                        {test.preconditions.map((pre, idx) => (
                          <li key={idx}>
                            <Typography variant="body2">{pre}</Typography>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Étapes:
                  </Typography>
                  {test.steps.map((step) => (
                    <Box key={step.stepNumber} mb={2}>
                      <Typography variant="body2" fontWeight={600}>
                        {step.stepNumber}. {step.action}
                      </Typography>
                      <Typography variant="body2" color="success.main" sx={{ pl: 2 }}>
                        → {step.expectedResult}
                      </Typography>
                      {step.testData && (
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                          Données: {step.testData}
                        </Typography>
                      )}
                    </Box>
                  ))}

                  <Box display="flex" gap={1} mt={2}>
                    <Button size="small" startIcon={<Edit />}>
                      Modifier
                    </Button>
                    <Button size="small" color="error" startIcon={<Delete />}>
                      Supprimer
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default StoryTestCases;
