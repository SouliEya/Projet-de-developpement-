import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Alert,
  Stack, TextField, MenuItem, Tabs, Tab, Avatar
} from '@mui/material';
import {
  Description, BugReport, Science, FolderOpen
} from '@mui/icons-material';
import api from '../services/api';

interface Ticket {
  _id: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  severity?: string;
  type: 'story' | 'bug' | 'testcase';
  createdAt: string;
}

const BacklogUnified: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    type: 'all',
    priority: 'all',
    status: 'all'
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const [storiesRes, bugsRes, testCasesRes] = await Promise.all([
        api.get('/stories'),
        api.get('/bugs'),
        api.get('/testcases')
      ]);

      const stories: Ticket[] = (storiesRes.data.data || []).map((s: any) => ({
        ...s,
        type: 'story' as const
      }));

      const bugs: Ticket[] = (bugsRes.data.data || []).map((b: any) => ({
        ...b,
        type: 'bug' as const
      }));

      const testCases: Ticket[] = (testCasesRes.data.data || []).map((t: any) => ({
        ...t,
        type: 'testcase' as const
      }));

      setTickets([...stories, ...bugs, ...testCases]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getTicketIcon = (type: string) => {
    switch (type) {
      case 'story':
        return <Description sx={{ color: '#1976d2' }} />;
      case 'bug':
        return <BugReport sx={{ color: '#d32f2f' }} />;
      case 'testcase':
        return <Science sx={{ color: '#7c4dff' }} />;
      default:
        return <FolderOpen />;
    }
  };

  const getTicketTypeLabel = (type: string) => {
    switch (type) {
      case 'story':
        return 'User Story';
      case 'bug':
        return 'Bug';
      case 'testcase':
        return 'Test Case';
      default:
        return type;
    }
  };

  const getTicketTypeColor = (type: string) => {
    switch (type) {
      case 'story':
        return 'primary';
      case 'bug':
        return 'error';
      case 'testcase':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority?: string) => {
    const colors: any = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[priority || ''] || 'default';
  };

  const getSeverityColor = (severity?: string) => {
    const colors: any = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[severity || ''] || 'default';
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter.type !== 'all' && ticket.type !== filter.type) return false;
    if (filter.priority !== 'all' && ticket.priority !== filter.priority) return false;
    if (filter.status !== 'all' && ticket.status !== filter.status) return false;
    
    // Filter by tab
    if (tabValue === 1 && ticket.type !== 'story') return false;
    if (tabValue === 2 && ticket.type !== 'bug') return false;
    if (tabValue === 3 && ticket.type !== 'testcase') return false;
    
    return true;
  });

  const getTicketCount = (type?: string) => {
    if (!type) return tickets.length;
    return tickets.filter(t => t.type === type).length;
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
          📋 Backlog Unifié
        </Typography>
        <Chip label={`${tickets.length} ticket(s)`} color="primary" />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label={`Tous (${getTicketCount()})`} />
        <Tab label={`User Stories (${getTicketCount('story')})`} />
        <Tab label={`Bugs (${getTicketCount('bug')})`} />
        <Tab label={`Test Cases (${getTicketCount('testcase')})`} />
      </Tabs>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select
              label="Type"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="story">User Story</MenuItem>
              <MenuItem value="bug">Bug</MenuItem>
              <MenuItem value="testcase">Test Case</MenuItem>
            </TextField>

            <TextField
              select
              label="Priorité"
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
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
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="draft">Brouillon</MenuItem>
              <MenuItem value="ready">Prêt</MenuItem>
              <MenuItem value="todo">À faire</MenuItem>
              <MenuItem value="in_progress">En cours</MenuItem>
              <MenuItem value="ready_qa">Ready QA</MenuItem>
              <MenuItem value="testing">Testing</MenuItem>
              <MenuItem value="done">Terminé</MenuItem>
              <MenuItem value="open">Ouvert</MenuItem>
              <MenuItem value="closed">Fermé</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {filteredTickets.length === 0 ? (
          <Alert severity="info">Aucun ticket trouvé.</Alert>
        ) : (
          filteredTickets.map((ticket) => (
            <Card 
              key={`${ticket.type}-${ticket._id}`} 
              sx={{ 
                '&:hover': { boxShadow: 4, cursor: 'pointer' },
                borderLeft: `4px solid ${
                  ticket.type === 'story' ? '#1976d2' : 
                  ticket.type === 'bug' ? '#d32f2f' : '#7c4dff'
                }`
              }}
              onClick={() => {
                if (ticket.type === 'story') navigate(`/stories`);
                else if (ticket.type === 'bug') navigate(`/bugs`);
                else navigate(`/testcases`);
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Avatar sx={{ 
                    bgcolor: ticket.type === 'story' ? '#e3f2fd' : 
                            ticket.type === 'bug' ? '#ffebee' : '#f3e5f5',
                    width: 48,
                    height: 48
                  }}>
                    {getTicketIcon(ticket.type)}
                  </Avatar>

                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip 
                        label={getTicketTypeLabel(ticket.type)} 
                        color={getTicketTypeColor(ticket.type) as any}
                        size="small"
                      />
                      {ticket.priority && (
                        <Chip 
                          label={ticket.priority} 
                          color={getPriorityColor(ticket.priority) as any}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {ticket.severity && (
                        <Chip 
                          label={`Sévérité: ${ticket.severity}`} 
                          color={getSeverityColor(ticket.severity) as any}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {ticket.status && (
                        <Chip 
                          label={ticket.status} 
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {ticket.title}
                    </Typography>

                    {ticket.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {ticket.description}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default BacklogUnified;
