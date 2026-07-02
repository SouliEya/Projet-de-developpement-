import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Chip, Divider, Grid, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper
} from '@mui/material';

interface DetailField {
  label: string;
  value: any;
  type?: 'text' | 'chip' | 'chips' | 'date' | 'list' | 'steps' | 'link';
  color?: any;
}

interface DetailDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: DetailField[];
}

const DetailDialog: React.FC<DetailDialogProps> = ({ open, onClose, title, fields }) => {
  const renderValue = (field: DetailField) => {
    if (field.value === null || field.value === undefined || field.value === '') {
      return <Typography variant="body2" color="text.secondary">—</Typography>;
    }

    switch (field.type) {
      case 'chip':
        return <Chip label={field.value} color={field.color || 'default'} size="small" />;

      case 'chips':
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(Array.isArray(field.value) ? field.value : []).map((v: string, i: number) => (
              <Chip key={i} label={v} size="small" variant="outlined" />
            ))}
            {(!Array.isArray(field.value) || field.value.length === 0) && (
              <Typography variant="body2" color="text.secondary">—</Typography>
            )}
          </Box>
        );

      case 'date':
        return (
          <Typography variant="body2">
            {new Date(field.value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Typography>
        );

      case 'list':
        return (
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {(Array.isArray(field.value) ? field.value : []).map((item: string, i: number) => (
              <li key={i}><Typography variant="body2">{item}</Typography></li>
            ))}
            {(!Array.isArray(field.value) || field.value.length === 0) && (
              <Typography variant="body2" color="text.secondary">Aucun</Typography>
            )}
          </Box>
        );

      case 'steps':
        return (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 0.5 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fc' }}>
                  <TableCell sx={{ fontWeight: 700, width: 40 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Résultat attendu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Données</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(Array.isArray(field.value) ? field.value : []).map((step: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell><Chip label={step.stepNumber || i + 1} size="small" color="primary" /></TableCell>
                    <TableCell><Typography variant="body2">{step.action}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{step.expectedResult}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{step.testData || '—'}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'link':
        return (
          <Chip label={field.value} size="small" color="primary" variant="outlined" />
        );

      default:
        return <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{String(field.value)}</Typography>;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f8f9fc' }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>
        <Grid container spacing={2}>
          {fields.map((field, idx) => (
            <React.Fragment key={idx}>
              {(field.type === 'steps' || field.type === 'list') ? (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {field.label}
                  </Typography>
                  {renderValue(field)}
                </Grid>
              ) : (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {field.label}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>{renderValue(field)}</Box>
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailDialog;
