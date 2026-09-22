import { getCalendarService } from "../../services/lx/calendarService.js";
import { handleControllerErrorResponse } from "../../utils/responseUtils.js";

export const getCalendarController = async (req, res) => {
    try {
        const { from, to, type } = req.query;
        const result = await getCalendarService({ from, to, type });
        return res.status(result.statusCode).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        handleControllerErrorResponse(error, "getCalendarController", req, res);
    }
};
