import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Avatar, Menu, MenuItem, Divider, Chip
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Description, BugReport, PlayArrow,
  Science, People, Campaign, Logout, AccountCircle
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'qa_engineer', 'test_manager', 'developer'] },
  { text: 'User Stories', icon: <Description />, path: '/stories', roles: ['admin', 'qa_engineer', 'test_manager'] },
  { text: 'Plans de Test', icon: <Science />, path: '/testcases', roles: ['admin', 'qa_engineer', 'test_manager'] },
  { text: 'Campagnes', icon: <Campaign />, path: '/campaigns', roles: ['admin', 'qa_engineer', 'test_manager'] },
  { text: 'Exécution', icon: <PlayArrow />, path: '/execution', roles: ['admin', 'qa_engineer'] },
  { text: 'Bugs', icon: <BugReport />, path: '/bugs', roles: ['admin', 'qa_engineer', 'test_manager', 'developer'] },
  { text: 'Utilisateurs', icon: <People />, path: '/users', roles: ['admin'] },
];

const roleLabels: Record<string, string> = {
  admin: 'Admin', qa_engineer: 'QA Engineer', test_manager: 'Test Manager', developer: 'Développeur'
};

const Layout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: '#0d1b2a' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Science sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
            Smart Test Assistant
          </Typography>
          <Chip label={roleLabels[user?.role || ''] || user?.role} size="small" sx={{ mr: 2, color: '#fff', borderColor: '#778da9' }} variant="outlined" />
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', fontSize: 14 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <AccountCircle sx={{ mr: 1 }} /> {user?.firstName} {user?.lastName}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}><Logout sx={{ mr: 1 }} /> Déconnexion</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', mt: '64px', bgcolor: '#f8f9fa' },
        }}
      >
        <List sx={{ pt: 2 }}>
          {filteredMenu.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1, borderRadius: 2, mb: 0.5,
                '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#1565c0' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? '#1565c0' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname === item.path ? 600 : 400 }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px', ml: drawerOpen ? 0 : `-${DRAWER_WIDTH}px`, transition: 'margin 0.3s' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
