import { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardContent, Grid, Divider, Chip, Select, MenuItem, FormControl } from '@mui/material';
import { Line, Chart as ChartJS } from 'react-chartjs-2';
import { Chart, BarElement, LineElement, PointElement, LineController, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { getResult } from '../services/ReportService.js';
Chart.register(BarElement, LineElement, PointElement, LineController, CategoryScale, LinearScale, Title, Tooltip, Legend);

const lineOptions = {
  plugins: {
	tooltip: {
		enabled: false
	}
  },
  maintainAspectRatio: true,
  scales: {
	y: {
		ticks: {
			display: false,
		},
		grid: {
			drawTicks: false
		}
	}
  }
};

const data_2025 = {
  labels: ['2021', '2022', '2023', '2024', '2025'],
  datasets: [
    {
      label: '고과 평점',
      data: [80, 85, 85, 80, 90],
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
    },
  ],
};

const mixedData_2025 = {
  labels: ['2021', '2022', '2023', '2024', '2025'],
  datasets: [
    {
      type: 'bar',
      label: '팀 실적',
      data: [85, 90, 95, 92, 98],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
    {
      type: 'line',
      label: '개인 실적',
      data: [80, 85, 85, 80, 90],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: false,
      tension: 0.4,
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
    },
  ],
};
const data_2024 = {
  labels: ['2020', '2021', '2022', '2023', '2024'],
  datasets: [
    {
      label: '고과 평점',
      data: [85, 80, 85, 85, 80],
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
    },
  ],
};

const mixedData_2024 = {
  labels: ['2020', '2021', '2022', '2023', '2024'],
  datasets: [
    {
      type: 'bar',
      label: '팀 실적',
      data: [97, 85, 90, 95, 92],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
    {
      type: 'line',
      label: '개인 실적',
      data: [85, 80, 85, 85, 80],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: false,
      tension: 0.4,
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
    },
  ],
};
const data_2023 = {
  labels: ['2019', '2020', '2021', '2022', '2023'],
  datasets: [
    {
      label: '고과 평점',
      data: [90, 85, 80, 85, 85],
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
    },
  ],
};

const mixedData_2023 = {
  labels: ['2019', '2020', '2021', '2022', '2023'],
  datasets: [
    {
      type: 'bar',
      label: '팀 실적',
      data: [87, 97, 85, 90, 85],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
    {
      type: 'line',
      label: '개인 실적',
      data: [90, 85, 80, 85, 85],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: false,
      tension: 0.4,
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
    },
  ],
};

const employeeReport = {
	employee: {
		name: '김민재',
		center: '시험자동화연구소',
        division: '검증실',
		team: '검증팀',
	},
	evaluation: {
	strengths: '이서연 님은 다양한 환경에서도 일관된 성능을 발휘하는 자동화 스크립트를 작성하여 프로젝트의 안정성을 크게 높였습니다. <strong>자동화 스크립트의 정확성과 안정성</strong>이 매우 뛰어나며, 이로 인해 프로젝트의 전반적인 품질이 향상되었습니다. 또한, 테스트 프로세스의 개선에 있어 이서연 님의 기여는 상당히 중요했습니다. 새로운 아이디어를 제안하고 이를 통해 효율성을 높였으며, 품질의 향상에도 크게 기여하였습니다. <strong>새로운 자동화 도구를 신속하게 학습하고 이를 실무에 성공적으로 적용</strong>하여, 팀의 기술적 역량을 크게 강화했습니다.',
	weaknesses: '이서연 님의 <strong>프로젝트 일정 준수와 업무 완성도의 측면에서 개선의 여지</strong>가 보입니다. 일정 내에 업무를 완료하는 데 어려움을 겪은 경우가 있었으며, 이는 전체 팀의 일정에도 영향을 미칠 수 있는 부분입니다. 또한, 협업 및 커뮤니케이션 능력이 뛰어나다고 평가되었지만, 보다 다양한 팀원이나 부서와의 교류를 통해 더 폭넓은 협력 관계를 유지하는 것이 필요할 수 있습니다.',
	improvements: '이서연 님은 프로젝트 일정 관리와 업무의 완성도를 높이기 위해 보다 체계적인 계획 수립과 관리가 필요합니다. 더불어, <strong>다양한 팀원과의 적극적인 소통</strong>을 통해 협업의 폭을 넓히고, 이를 통해 프로젝트 진행의 원활함을 더욱 개선할 수 있습니다. 프로젝트 일정의 준수와 완성도를 높이기 위해 업무의 우선순위를 보다 명확하게 설정하고, 이를 기반으로 효율적인 시간 관리를 시도해보는 것도 도움이 될 것입니다.',
	overallEvaluation: '이서연 님은 자동화 스크립트의 정확성과 안정성, 테스트 프로세스 개선에 있어 매우 우수한 성과를 보여주었습니다. 신규 기술의 신속한 학습과 적용 능력도 팀의 기술적 성장을 돕는 중요한 역할을 했습니다. 반면에, 일정 관리와 업무 완성도에 있어서는 더 많은 주의가 필요합니다. 이서연 님의 뛰어난 기술력과 문제 해결 능력을 바탕으로, 일정 관리와 협업의 효율성을 높인다면 앞으로 더 많은 성과를 기대할 수 있을 것입니다.'
},
};

const EmployeeReportPage = () => {
	const [selectedYear, setSelectedYear] = useState(2025);
	const [selectedData, setSelectedData] = useState(data_2025);
	const [selectedMixedData, setSelectedMixedData] = useState(mixedData_2025);
	const [degree, setDegree] = useState('A');
	const [degreeColor, setDegreeColor] = useState('red');
	const [result, setResult] = useState({ name: '', center: '', division: '', team: '', score: '', feedback: '' });
	const [report, setReport] = useState({ strengths: '', weaknesses: '', improvements: '', overallEvaluation: '' });

	useEffect(() => {
		generateReportData();
	}, []);

	useEffect(() => {
		if (result && result.feedback.length > 0) {
			setReport(JSON.parse(result.feedback));
		}
		if (result && result.score >= 90) {
			setDegree('A');
			setDegreeColor('red');
		} else if (result && result.score > 80) {
			setDegree('B+');
			setDegreeColor('green');
		} else {
			setDegree('B-');
			setDegreeColor('blue');
		}
	}, [result]);

	useEffect(() => {
		generateReportData();
		if (selectedYear === 2025) {
			// setDegree('A');
			// setDegreeColor('red');
			setSelectedData(data_2025);
			setSelectedMixedData(mixedData_2025);
		} else if (selectedYear === 2024) {
			// setDegree('B-');
			// setDegreeColor('blue');
			setSelectedData(data_2024);
			setSelectedMixedData(mixedData_2024);
		} else if (selectedYear === 2023) {
			// setDegree('B+');
			// setDegreeColor('green');
			setSelectedData(data_2023);
			setSelectedMixedData(mixedData_2023);
		}
	}, [selectedYear]);

	const generateReportData = async () => {
		try {
			const reportData = await getResult(localStorage.getItem('username'), selectedYear);
			if (reportData) {
				setResult(reportData);
			}
		} catch (error) {
			console.error('리포트 생성 오류:', error);
		}
	};

	return (
			<Container maxWidth="md">
				<Box sx={{ m: 0 }}>
					<Card elevation={4} sx={{ py: 3, px: 3, width: '100%' }}>
					<CardContent>
						<Grid container spacing={4} alignItems="center" justifyContent="space-between">
							<Grid item xs>
								<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
									<Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
										{result.name}
									</Typography>
									<Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
										{selectedYear} 인사평가 리포트
									</Typography>
								</Box>
								<Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
									<Chip label={`${result.center} / ${result.division} / ${result.team}`} color="default" />
                                    <FormControl variant="outlined" size="small">
                                        <Select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            sx={{ borderRadius: 6, height: 33 }}
                                        >
                                            <MenuItem value={2025}>2025</MenuItem>
                                            <MenuItem value={2024}>2024</MenuItem>
                                            <MenuItem value={2023}>2023</MenuItem>
                                        </Select>
                                    </FormControl>
								</Box>
							</Grid>
                            <Grid item>
								<Box sx={{ width: 92, height: 92, bgcolor: degreeColor, color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignSelf: 'center', fontWeight: 'bold', fontSize: 62, boxShadow: 1, lineHeight: 'normal' }}>
									{degree}
								</Box>
							</Grid>
						</Grid>
						<Divider sx={{ my: 3 }} />
									{/* 꺾은선 그래프 공간 */}
									<Box sx={{ mb: 4, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
										<Line data={selectedData} options={lineOptions} />
									</Box>
                                    {/* 혼합 차트 */}
                                    <Box sx={{ mb: 4, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                        <ChartJS type='bar' data={selectedMixedData} options={lineOptions} />
                                    </Box>
									{/* 강점 */}
									<Box sx={{ mb: 4 }}>
										<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }} color="success.main">
											💪 강점
										</Typography>
										<Typography variant="body1" sx={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: report.strengths }} />
									</Box>
						<Divider sx={{ my: 2 }} />

									{/* 약점 */}
									<Box sx={{ mb: 4 }}>
										<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }} color="error.main">
											⚠️ 약점
										</Typography>
										<Typography variant="body1" sx={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: report.weaknesses }} />
									</Box>
						<Divider sx={{ my: 2 }} />

									{/* 개선 방안 */}
									<Box sx={{ mb: 4 }}>
										<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }} color="primary">
											🌱 개선 방안
										</Typography>
										<Typography variant="body1" sx={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: report.improvements }} />
									</Box>
						<Divider sx={{ my: 2 }} />

									{/* 총평 */}
									<Box>
										<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
											📝 총평
										</Typography>
										<Typography variant="body1" dangerouslySetInnerHTML={{ __html: report.overallEvaluation }} />
									</Box>
					</CardContent>
				</Card>
			</Box>
		</Container>
	);
};

export default EmployeeReportPage;
