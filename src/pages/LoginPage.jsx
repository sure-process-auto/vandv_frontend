import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';

const LoginPage = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loginError, setLoginError] = useState(false);
	const navigate = useNavigate();
	const PW = 'suresoft';

	const handleLogin = (e) => {
		e.preventDefault();
		// 로그인 처리 로직 (예시)
		if (username === 'pm' && password === PW) {
			// PM 역할 저장
			localStorage.setItem('userRole', 'pm');
			localStorage.setItem('username', username);
			navigate('/evaluation');
		} else if (username === 'pm2' && password === PW) {
			// 일반 사용자 역할 저장
			localStorage.setItem('userRole', 'user');
			localStorage.setItem('username', username);
			navigate('/result');
		} else if (username === 'user' && password === PW) {
			// 일반 사용자 역할 저장
			localStorage.setItem('userRole', 'user');
			localStorage.setItem('username', username);
			navigate('/result');
		} else if (username === 'user2' && password === PW) {
			// 일반 사용자 역할 저장
			localStorage.setItem('userRole', 'user');
			localStorage.setItem('username', username);
			navigate('/result');
		} else {
			setLoginError(true);
		}
	};

	// 입력값 변경 시 에러 상태 초기화
	const handleUsernameChange = (e) => {
		setUsername(e.target.value);
		setLoginError(false);
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
		setLoginError(false);
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 50%, #FFF3E0 100%)',
			}}
		>
			<Container maxWidth="xs">
				<Paper 
					elevation={3} 
					sx={{ 
						p: 4, 
						borderRadius: 2,
						backgroundColor: 'rgba(255, 255, 255, 0.85)',
						backdropFilter: 'blur(10px)',
					}}
				>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
						<Box
							component="img"
							src="/logo-vertical.png"
							alt="Sure Score Logo"
							sx={{ 
								width: '100%',
								maxWidth: 250,
								height: 'auto',
								mb: 3,
								objectFit: 'contain'
							}}
						/>
						<Typography component="h1" variant="h5" sx={{ mb: 2 }}>
							로그인
						</Typography>
						<Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
							{loginError && (
								<Alert severity="error" sx={{ mb: 2 }}>
									로그인 실패! 사용자명과 비밀번호를 확인해주세요.
								</Alert>
							)}
							<TextField
								margin="normal"
								required
								fullWidth
								id="username"
								label="사용자명"
								name="username"
								autoComplete="username"
								autoFocus
								value={username}
								onChange={handleUsernameChange}
								error={loginError}
							/>
							<TextField
								margin="normal"
								required
								fullWidth
								name="password"
								label="비밀번호"
								type="password"
								id="password"
								autoComplete="current-password"
								value={password}
								onChange={handlePasswordChange}
								error={loginError}
							/>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								sx={{ mt: 3, mb: 2 }}
							>
								로그인
							</Button>
						</Box>
				</Box>
			</Paper>
		</Container>
		</Box>
	);
};

export default LoginPage;
