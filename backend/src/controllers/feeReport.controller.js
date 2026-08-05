import { asyncHandler } from '../utils/asyncHandler.js';
import { toFullUrl } from '../utils/imageUrl.js';
import feeReportService from '../services/feeReport.service.js';

const mapImages = (req, report) => {
  if (report.school?.schoolLogo) {
    report.school.schoolLogo = toFullUrl(req, report.school.schoolLogo);
  }
  if (Array.isArray(report.rows)) {
    for (const row of report.rows) {
      if (row.studentImage) {
        row.studentImage = toFullUrl(req, row.studentImage);
      }
    }
  }
  return report;
};

const getReport = asyncHandler(async (req, res) => {
  const report = await feeReportService.generateReport(req.reportFilters, req.user);
  mapImages(req, report);

  return res.status(200).json({
    success: true,
    message: 'Report generated successfully',
    data: report,
  });
});

const printReport = asyncHandler(async (req, res) => {
  const report = await feeReportService.generateReport(req.reportFilters, req.user);
  mapImages(req, report);

  return res.status(200).json({
    success: true,
    message: 'Report ready for printing',
    data: report,
  });
});

const exportPdf = asyncHandler(async (req, res) => {
  const buffer = await feeReportService.generateReportPdf(req.reportFilters, req.user);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="fee-report-${req.reportFilters.reportType}.pdf"`);
  return res.status(200).send(buffer);
});

const exportExcel = asyncHandler(async (req, res) => {
  const buffer = await feeReportService.generateReportExcel(req.reportFilters, req.user);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="fee-report-${req.reportFilters.reportType}.xlsx"`);
  return res.status(200).send(buffer);
});

export {
  getReport,
  printReport,
  exportPdf,
  exportExcel,
};
