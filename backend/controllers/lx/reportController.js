import {
    buildReportCsv,
    getReportService,
    getSemestersService,
    rolloverSemesterService,
} from "../../services/lx/reportService.js";
import { handleControllerErrorResponse } from "../../utils/responseUtils.js";

export const getReportCsvController = async (req, res) => {
    try {
        const semester = req.query.semester || undefined;
        const result = await getReportService(semester);
        const csv = buildReportCsv(result.data);
        const filename = `lx-report-${String(result.data.semester).replace(/\s+/g, "-").toLowerCase()}.csv`;
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        return res.status(200).send(csv);
    } catch (error) {
        handleControllerErrorResponse(error, "getReportCsvController", req, res);
    }
};

export const getReportController = async (req, res) => {
    try {
        const semester = req.query.semester || undefined;
        const result = await getReportService(semester);
        return res.status(result.statusCode).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        handleControllerErrorResponse(error, "getReportController", req, res);
    }
};

export const getSemestersController = async (req, res) => {
    try {
        const result = await getSemestersService();
        return res.status(result.statusCode).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        handleControllerErrorResponse(error, "getSemestersController", req, res);
    }
};

export const rolloverController = async (req, res) => {
    try {
        const validated = req.body;
        const result = await rolloverSemesterService(validated);
        return res.status(result.statusCode).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        handleControllerErrorResponse(error, "rolloverController", req, res);
    }
};
