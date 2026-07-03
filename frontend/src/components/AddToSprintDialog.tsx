import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItemButton, ListItemText, CircularProgress, Alert,
  Typography, Chip, Box
} from '@mui/material';
import { DirectionsRun } from '@mui/icons-material';
import api from '../services/api';

interface Sprint {
  _id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  stories: any[];
}

interface AddToSprintDialogProps {
  open: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  onSuccess?: () => void;
}

const AddToSprintDialog: React.FC<AddToSprintDialogProps> = ({
  open,
  onClose,
  storyId,
  storyTitle,
  onSuccess
}) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSprints();
    }
  }, [open]);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sprints');
      // Filtrer pour n'afficher que les sprints actifs ou planifiés
      const availableSprints = response.data.data.filter(
        (s: Sprint) => s.status === 'active' || s.status === 'planned'
      );
      setSprints(availableSprints);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToSprint = async () => {
    if (!selectedSprint) return;

    try {
      setAdding(true);
      setError('');
      await api.post(`/sprints/${selectedSprint}/stories`, { storyId });
      
      if (onSuccess) onSuccess();
      onClose();
      setSelectedSprint(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout au sprint');
    } finally {
      setAdding(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Actif' : 'Planifié';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <DirectionsRun />
          Ajouter au Sprint
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Story : <strong>{storyTitle}</strong>
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : sprints.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Aucun sprint disponible. Créez un sprint actif ou planifié pour ajouter des stories.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
              Sélectionnez un sprint :
            </Typography>
            <List>
              {sprints.map((sprint) => (
                <ListItemButton
                  key={sprint._id}
                  selected={selectedSprint === sprint._id}
                  onClick={() => setSelectedSprint(sprint._id)}
                  sx={{
                    border: '1px solid',
                    borderColor: selectedSprint === sprint._id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight={600}>
                          {sprint.name}
                        </Typography>
                        <Chip
                          label={getStatusLabel(sprint.status)}
                          color={getStatusColor(sprint.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        {new Date(sprint.startDate).toLocaleDateString('fr-FR')} - {new Date(sprint.endDate).toLocaleDateString('fr-FR')}
                        <br />
                        {sprint.stories?.length || 0} stories
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={adding}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleAddToSprint}
          disabled={!selectedSprint || adding}
          startIcon={adding ? <CircularProgress size={20} /> : <DirectionsRun />}
        >
          {adding ? 'Ajout...' : 'Ajouter au Sprint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToSprintDialog;
