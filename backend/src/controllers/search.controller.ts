import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { asyncHandler, errors } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

export class SearchController {
  /**
   * Global enterprise search endpoint
   */
  static search = asyncHandler(async (req: Request, res: Response) => {
    const q = req.query.q as string | undefined;
    const type = req.query.type as string | undefined;

    // Validate request query
    if (!q || q.trim().length === 0) {
      throw errors.badRequest('Search query term "q" is required');
    }

    const results = await SearchService.globalSearch(
      req.user!.userId,
      q.trim(),
      type || 'all'
    );

    return sendSuccess(res, { results }, 'Search results retrieved successfully');
  });
}
