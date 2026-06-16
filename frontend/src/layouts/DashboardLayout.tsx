import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  Stack,
  Chip,
  InputBase,
  Paper,
  ClickAwayListener,
} from '@mui/material';
import SearchDropdown from '../components/common/SearchDropdown';
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  ChevronLeft as ChevronLeftIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Group as GroupIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDrawer from '@/components/common/NotificationDrawer';
import { useNotifications } from '@/hooks/useNotifications';
import { useThemeMode } from '@/theme/ThemeProvider';
import { useLogout } from '@/hooks/useAuth';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Inbox', icon: <EmailIcon />, path: '/inbox' },
  { label: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' },
  { label: 'Meetings', icon: <GroupIcon />, path: '/meetings' },
  { label: 'Documents', icon: <FolderIcon />, path: '/documents' },
  { label: 'Approvals', icon: <CheckCircleIcon />, path: '/approvals' },
  { label: 'Workflows', icon: <SettingsIcon />, path: '/workflows' },
  { label: 'Team', icon: <PeopleIcon />, path: '/team', roles: ['admin', 'manager'] },
  { label: 'Audit Logs', icon: <AssignmentIcon />, path: '/audit-logs', roles: ['admin'] },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const { user, hasRole } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read_status).length;

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r as 'admin' | 'manager' | 'employee'))
  );

  const handleProfileMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box height="100%" display="flex" flexDirection="column">
      {/* Sidebar Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          background: 'linear-gradient(135deg, #0078D4 0%, #6264A7 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BusinessIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight={700} color="white" lineHeight={1.2}>
            Workflow Hub
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Enterprise Platform
          </Typography>
        </Box>
        {isMobile && (
          <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 40, height: 40, backgroundColor: 'primary.main', fontWeight: 700 }}>
            {user?.name?.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box minWidth={0}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {user?.name}
            </Typography>
            <Chip
              label={user?.role || 'user'}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: 'primary.main',
                color: 'white',
                textTransform: 'capitalize',
              }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 1, px: 1 }}>
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { backgroundColor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Sidebar Footer */}
      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, color: 'error.main', '& .MuiListItemIcon-root': { color: 'error.main' } }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Sign out" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box display="flex" minHeight="100vh" sx={{ backgroundColor: 'background.default' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: isMobile ? 4 : 1,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content area */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        minWidth={0}
        sx={{ transition: theme.transitions.create('margin', { duration: 200 }) }}
      >
        {/* Top AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: 56 }}>
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label="toggle sidebar"
            >
              <MenuIcon />
            </IconButton>

            {/* Page title */}
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ display: { xs: searchOpen ? 'none' : 'block', md: 'block' }, flex: { xs: 1, md: 0 } }}
            >
              {visibleNavItems.find((n) => n.path === location.pathname)?.label || 'Workflow Hub'}
            </Typography>

            {/* ── Desktop Search Bar ─────────────────────────────────── */}
            <ClickAwayListener onClickAway={() => setSearchFocused(false)}>
              <Box position="relative" sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, maxWidth: 380, mx: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    px: 1.5,
                    py: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'action.hover',
                    transition: 'border-color 0.15s, background-color 0.15s',
                    '&:focus-within': {
                      borderColor: 'primary.main',
                      backgroundColor: 'background.paper',
                    },
                  }}
                >
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1, flexShrink: 0 }} />
                  <InputBase
                    id="global-search"
                    placeholder="Search tasks, projects, people…"
                    value={searchValue}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => setSearchValue(e.target.value)}
                    sx={{ flex: 1, fontSize: '0.875rem' }}
                    inputProps={{ 'aria-label': 'global search' }}
                  />
                  {searchValue && (
                    <IconButton size="small" onClick={() => setSearchValue('')} sx={{ p: 0.25 }}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Paper>
                <SearchDropdown
                  open={searchFocused}
                  onClose={() => setSearchFocused(false)}
                  query={debouncedSearchValue}
                  onSelectTerm={(term) => setSearchValue(term)}
                />
              </Box>
            </ClickAwayListener>

            {/* ── Mobile Search Toggle ───────────────────────────────── */}
            {searchOpen ? (
              <ClickAwayListener onClickAway={() => { setSearchOpen(false); setSearchFocused(false); }}>
                <Box position="relative" sx={{ display: { xs: 'flex', md: 'none' }, flex: 1 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      px: 1.5,
                      py: 0.5,
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 16, color: 'primary.main', mr: 1 }} />
                    <InputBase
                      autoFocus
                      placeholder="Search…"
                      value={searchValue}
                      onFocus={() => setSearchFocused(true)}
                      onChange={(e) => setSearchValue(e.target.value)}
                      sx={{ flex: 1, fontSize: '0.875rem' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => { setSearchOpen(false); setSearchValue(''); setSearchFocused(false); }}
                      sx={{ p: 0.25 }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Paper>
                  <SearchDropdown
                    open={searchFocused}
                    onClose={() => { setSearchFocused(false); setSearchOpen(false); }}
                    query={debouncedSearchValue}
                    onSelectTerm={(term) => setSearchValue(term)}
                  />
                </Box>
              </ClickAwayListener>
            ) : (
              <IconButton
                aria-label="search"
                onClick={() => { setSearchOpen(true); setSearchFocused(true); }}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              >
                <SearchIcon />
              </IconButton>
            )}

            {/* Spacer on desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1 }} />

            {/* Theme toggle */}
            <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={toggleTheme} aria-label="toggle theme">
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton aria-label="notifications" onClick={() => setNotificationDrawerOpen(true)}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile avatar */}
            <Tooltip title="Account">
              <IconButton onClick={handleProfileMenuOpen} aria-label="account menu" size="small">
                <Avatar sx={{ width: 34, height: 34, backgroundColor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
                  {user?.name?.slice(0, 2).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: { mt: 1, minWidth: 180, borderRadius: 2 },
          }}
        >
          <Box px={2} py={1.5}>
            <Typography variant="subtitle2" fontWeight={700}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>

        {/* Page Content */}
        <Box flex={1} p={{ xs: 2, sm: 3, md: 4 }} maxWidth="100%">
          {children}
        </Box>
      </Box>

      {/* Notification Drawer */}
      <NotificationDrawer 
        open={notificationDrawerOpen} 
        onClose={() => setNotificationDrawerOpen(false)} 
      />
    </Box>
  );
};

export default DashboardLayout;
