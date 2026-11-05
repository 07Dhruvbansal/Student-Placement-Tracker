export const exportToCSV = (data, filename = 'student_placements.csv') => {
  if (!data || !data.length) return;

  const headers = ['Student Name', 'Roll Number', 'Department', 'Company', 'Role', 'CTC (LPA)', 'Stage', 'Interview Date', 'Notes'];
  
  const csvRows = [
    headers.join(','),
    ...data.map(item => [
      `"${item.studentName || ''}"`,
      `"${item.rollNumber || ''}"`,
      `"${item.department || ''}"`,
      `"${item.companyName || ''}"`,
      `"${item.roleTitle || ''}"`,
      item.ctcLpa || 0,
      `"${item.stage || ''}"`,
      `"${item.interviewDate ? new Date(item.interviewDate).toISOString().split('T')[0] : ''}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ].join(','))
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};