import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography } from '@mui/material';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = (e) => {
		e.preventDefault();
		// 로그인 처리 로직 (예시)
		alert(`이메일: ${email}\n비밀번호: ${password}`);
	};

	return (
		<Container maxWidth="xs">
			<Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<Typography component="h1" variant="h5">
					로그인
				</Typography>
				<Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
					<TextField
						margin="normal"
						required
						fullWidth
						id="email"
						label="이메일 주소"
						name="email"
						autoComplete="email"
						autoFocus
						value={email}
						onChange={(e) => setEmail(e.target.value)}
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
		</Container>
	);
};

export default Login;
