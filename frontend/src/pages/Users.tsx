import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchUsers } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import {
  Box, Typography, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Alert
} from '@mui/material';
import { Edit, Delete, PersonAdd } from '@mui/icons-material';

const roleLabels: any = { 
  admin: 'Admin', 
  qa_engineer: 'QA Engineer', 
  test_manager: 'Test Manager', 
  developer: 'Développeur',
  product_owner: 'Product Owner'
};
const roleColors: any = { 
  admin: 'error', 
  qa_engineer: 'primary', 
  test_manager: 'secondary', 
  developer: 'default',
  product_owner: 'success'
};

const Users: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.auth);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'qa_engineer', isActive: true });

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const handleOpen = (user?: any) => {
    if (user) {
      setEditId(user._id);
      setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', role: user.role, isActive: user.isActive });
    } else {
      setEditId(null);
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'qa_engineer', isActive: true });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        // Mise à jour d'un utilisateur existant
        const updateData: any = { firstName: form.firstName, lastName: form.lastName, role: form.role, isActive: form.isActive };
        if (form.password) {
          updateData.password = form.password;
        }
        await authAPI.updateUser(editId, updateData);
        setSuccess('Utilisateur mis à jour.');
      } else {
        // Création d'un nouvel utilisateur
        await authAPI.register({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role
        });
        setSuccess('Utilisateur créé avec succès.');
      }
      setOpen(false);
      dispatch(fetchUsers());
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      try {
        await authAPI.deleteUser(id);
        dispatch(fetchUsers());
        setSuccess('Utilisateur supprimé.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur');
      }
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      await authAPI.updateUser(user._id, { ...user, isActive: !user.isActive });
      dispatch(fetchUsers());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Gestion des Utilisateurs</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip label={`${users.length} utilisateur(s)`} color="primary" />
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => handleOpen()}>
            Nouvel Utilisateur
          </Button>
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rôle</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actif</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Créé le</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{user.firstName} {user.lastName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={roleLabels[user.role] || user.role} color={roleColors[user.role]} size="small" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={user.isActive} size="small" onChange={() => handleToggleActive(user)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpen(user)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(user._id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Modifier l\'utilisateur' : 'Nouvel Utilisateur'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField fullWidth label="Prénom" value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Nom" value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} 
            required={!editId} disabled={!!editId} />
          <TextField fullWidth label={editId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'} 
            type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} sx={{ mb: 2 }} 
            required={!editId}
            helperText={editId ? 'Laissez vide pour ne pas changer le mot de passe' : 'Minimum 6 caractères'} />
          <TextField fullWidth select label="Rôle" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })} sx={{ mb: 2 }}>
            {Object.entries(roleLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v as string}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            {editId ? 'Sauvegarder' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
