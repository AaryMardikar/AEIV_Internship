import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, Notification } from '../../hooks/useNotifications';

dayjs.extend(relativeTime);

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon color="success" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    default:
      return <InfoIcon color="info" />;
  }
};

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { data: notifications = [] } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = notifications.filter(n => !n.read_status).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_status) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllAsRead.mutate();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, bgcolor: 'background.default' }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
          <Typography variant="h6" fontWeight={700}>Notifications</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <List sx={{ p: 0 }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography color="text.secondary">You're all caught up!</Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.read_status ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: notification.read_status ? 'action.hover' : alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={notification.read_status ? 500 : 700}>
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        {dayjs(notification.created_at).fromNow()}
                      </Typography>
                    </Box>
                  }
                />
                {!notification.read_status && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      ml: 2
                    }}
                  />
                )}
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
    </Drawer>
  );
};

export default NotificationDrawer;
