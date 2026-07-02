import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { login, clearError } from '../store/slices/authSlice';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Science } from '@mui/icons-material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0d1b2a' }}>
      <Card sx={{ width: 420, p: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Science sx={{ fontSize: 48, color: '#1565c0', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="#0d1b2a">Smart Test Assistant</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Plateforme QA Intelligente</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required sx={{ mb: 2 }} autoFocus
            />
            <TextField
              fullWidth label="Mot de passe" type={showPassword ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required sx={{ mb: 3 }}
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
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: 16, fontWeight: 600 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
            </Button>
          </form>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Comptes de démo:</Typography>
            <Typography variant="caption" display="block" color="text.secondary">admin@sta.com / admin123</Typography>
            <Typography variant="caption" display="block" color="text.secondary">eya@sta.com / qa1234</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
