import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Divider,
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon 
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

// MUI 테마 설정 (파스텔 톤 - 텍스트 가독성 강화)
const theme = createTheme({
  palette: {
    primary: {
      main: '#5B9BD5',      // 선명한 파스텔 블루
      light: '#9DC3E6',
      dark: '#2E75B5',
    },
    secondary: {
      main: '#ED7D95',      // 선명한 파스텔 핑크
      light: '#F4A6B8',
      dark: '#D95975',
    },
    success: {
      main: '#70C1A5',      // 선명한 파스텔 민트
      light: '#A8E6CF',
      dark: '#4FA88B',
    },
    info: {
      main: '#8FA4D4',      // 선명한 파스텔 라벤더
      light: '#B8C7E8',
      dark: '#6B82B8',
    },
    warning: {
      main: '#F5C371',      // 선명한 파스텔 옐로우
      light: '#FFD89B',
      dark: '#E5A842',
    },
    error: {
      main: '#E57373',
      light: '#EF9A9A',
      dark: '#D32F2F',
    },
    background: {
      default: '#F5F7FA',   // 연한 그레이-블루 배경
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',   // 진한 검정 (가독성 최우선)
      secondary: '#424242', // 부가 정보용 진한 회색
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    allVariants: {
      color: '#212121',     // 모든 텍스트 기본 색상
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,    // 칩 텍스트 강조
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,    // 버튼 텍스트 강조
          textTransform: 'none', // 대문자 변환 제거
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(91, 155, 213, 0.15)',
        },
      },
    },
  },
});

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('');

  // 사용자 역할 가져오기
  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
  }, []);

  // 전체 메뉴 항목 정의
  const allMenuItems = [
    { id: 'evaluation', label: '평가', icon: <AssignmentIcon />, path: '/evaluation', roles: ['pm'] },
    { id: 'result', label: '결과', icon: <AnalyticsIcon />, path: '/result', roles: ['user'] },
    { id: 'settings', label: '설정', icon: <SettingsIcon />, path: '/settings', roles: ['pm'] },
  ];

  // 사용자 역할에 따라 메뉴 필터링
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  const handleLogout = () => {
    // 로그아웃 시 사용자 정보 삭제
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 50%, #FFF3E0 100%)',
      }}>
        {/* 고정된 상단 앱바 */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(15px)',
            borderBottom: '1px solid rgba(91, 155, 213, 0.2)',
            boxShadow: 'none',
          }}
        >
          <Toolbar>
            <Box
              component="img"
              src="/logo-horizontal.png"
              alt="Sure Score Logo"
              sx={{ 
                height: 60,
                width: 'auto',
                mr: 2,
                objectFit: 'contain'
              }}
            />
          </Toolbar>
        </AppBar>

        {/* 고정된 사이드바 */}
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(15px)',
              borderRight: '1px solid rgba(91, 155, 213, 0.2)',
              top: '64px', // AppBar 높이만큼 아래에 배치
              height: 'calc(100vh - 64px)',
            },
          }}
        >
          <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: 'text.primary',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(91, 155, 213, 0.25)',
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(91, 155, 213, 0.35)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(91, 155, 213, 0.15)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            
            {/* 로그아웃 버튼 (하단) */}
            <Box sx={{ marginTop: 'auto' }}>
              <Divider sx={{ borderColor: 'rgba(91, 155, 213, 0.3)' }} />
              <List>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={handleLogout}
                    sx={{
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: 'rgba(237, 125, 149, 0.15)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'text.primary' }}>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="로그아웃" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          </Box>
        </Drawer>

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            height: '100vh',
          }}
        >
          <Toolbar /> {/* AppBar 높이만큼 공간 확보 */}
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Layout;

