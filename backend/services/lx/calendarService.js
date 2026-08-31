import createContextLogger from '../../logger/contextLogger.js';
import { getCalendarEventsDal } from '../../dals/lx/calendarDal.js';

const logger = createContextLogger('calendarService');

export const getCalendarService = async (query) => {
  try {
    const events = await getCalendarEventsDal(query);
    return {
      success: true,
      message: 'Calendar events fetched successfully',
      statusCode: 200,
      data: events,
    };
  } catch (error) {
    logger.error('Error in getCalendarService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
