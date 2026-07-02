import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, MenuItem,
  CircularProgress, InputAdornment, IconButton, Link
} from '@mui/material';
import { Visibility, VisibilityOff, Science } from '@mui/icons-material';

const Register: React.FC = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'qa_engineer' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0d1b2a' }}>
      <Card sx={{ width: 460, p: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Science sx={{ fontSize: 48, color: '#1565c0', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="#0d1b2a">Créer un compte</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Smart Test Assistant</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Compte créé ! Redirection...</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField fullWidth label="Prénom" value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <TextField fullWidth label="Nom" value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </Box>
            <TextField fullWidth label="Email" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Mot de passe" type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              required sx={{ mb: 2 }} helperText="Minimum 6 caractères"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField fullWidth select label="Rôle" value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })} sx={{ mb: 3 }}>
              <MenuItem value="qa_engineer">QA Engineer</MenuItem>
              <MenuItem value="test_manager">Test Manager</MenuItem>
              <MenuItem value="developer">Développeur</MenuItem>
            </TextField>
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: 16, fontWeight: 600 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'S\'inscrire'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Déjà un compte ? <Link href="/login" underline="hover" sx={{ fontWeight: 600 }}>Se connecter</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
