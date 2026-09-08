import createContextLogger from '../../logger/contextLogger.js';
import { getFeedDal } from '../../dals/lx/feedDal.js';

const logger = createContextLogger('feedService');

export const getFeedService = async (query) => {
  try {
    const result = await getFeedDal(query);
    return {
      success: true,
      message: 'Feed fetched successfully',
      statusCode: 200,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (error) {
    logger.error('Error in getFeedService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
