import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper } from '@mui/material';

const LoginPage = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const PW = 'suresoft';

	const handleLogin = (e) => {
		e.preventDefault();
		// 로그인 처리 로직 (예시)
		if (username === 'pm' && password === PW) {
			alert('PM 로그인 성공!');
			navigate('/');
		} else if (username === 'user' || password === PW) {
			alert('사용자 로그인 성공!');
			navigate('/');
		} else {
			alert('로그인 실패!');
		}
	};

		return (
			<Container maxWidth="xs">
				<Paper elevation={3} sx={{ mt: 8, p: 4, borderRadius: 2 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
						<Typography component="h1" variant="h5">
							로그인
						</Typography>
						<Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
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
								onChange={(e) => setUsername(e.target.value)}
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
								onChange={(e) => setPassword(e.target.value)}
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
		);
};

export default LoginPage;
