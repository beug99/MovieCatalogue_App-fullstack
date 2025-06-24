// routes/movies.js

const express = require('express');
const router = express.Router();

const DEFAULT_LIMIT = 100;

/**
 * @route GET /movies/search
 * @desc Search movies with optional query parameters (title, year, page)
 * @access Public
 */
router.get('/search', async (req, res) => {
  try {
    const { title, year, page } = req.query;
    const limit = DEFAULT_LIMIT;

    // Validate page parameter
    if (page && isNaN(Number(page))) {
      return res.status(400).json({
        message: "Invalid page format. page must be a number."
      });
    }
    const currentPage = parseInt(page, 10) || 1;

    // Validate year parameter
    if (year && !/^\d{4}$/.test(year)) {
      return res.status(400).json({
        message: "Invalid year format. Format must be yyyy."
      });
    }

    // Count total matching records
    const countQuery = req.db('basics');
    if (title) {
      countQuery.where('primaryTitle', 'like', `%${title}%`);
    }
    if (year) {
      countQuery.andWhere('year', parseInt(year));
    }

    const totalCountResult = await countQuery.clone().count('* as count').first();
    const totalCount = parseInt(totalCountResult.count, 10) || 0;
    const lastPage = totalCount > 0 ? Math.ceil(totalCount / limit) : 0;
    const offset = (currentPage - 1) * limit;

    let data = [];
    if (offset < totalCount) {
      data = await req.db('basics')
        .select(
          'primaryTitle as title',
          'year',
          'tconst as imdbID',
          'imdbRating',
          'rottenTomatoesRating',
          'metacriticRating',
          'rated as classification'
        )
        .modify(q => {
          if (title) {
            q.where('primaryTitle', 'like', `%${title}%`);
          }
          if (year) {
            q.andWhere('year', parseInt(year));
          }
        })
        .orderBy('tconst', 'asc')
        .offset(offset)
        .limit(limit);
    }

    const formattedData = data.map(item => ({
      title: item.title || "Unknown Title",
      year: item.year !== null ? Number(item.year) : null,
      imdbID: item.imdbID || "Unknown IMDb ID",
      imdbRating: item.imdbRating !== null ? Number(item.imdbRating) : null,
      rottenTomatoesRating: item.rottenTomatoesRating !== null ? Number(item.rottenTomatoesRating) : null,
      metacriticRating: item.metacriticRating !== null ? Number(item.metacriticRating) : null,
      classification: item.classification || "N/A"
    }));

    res.status(200).json({
      data: formattedData,
      pagination: {
        total: totalCount,
        lastPage,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < lastPage ? currentPage + 1 : null,
        perPage: limit,
        currentPage,
        from: offset,
        to: offset + formattedData.length
      }
    });
  } catch (error) {
    console.error("Error in /movies/search:", error);
    res.status(500).json({
      message: "Internal Server Error",
      details: error.message
    });
  }
});

/**
 * @route GET /movies/data/:imdbID
 * @desc Retrieve movie details by IMDb ID
 * @access Public
 */
router.get('/data/:imdbID', async (req, res) => {
  const { imdbID } = req.params;

  // Reject any query parameters
  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({
      error: true,
      message: "Query parameters are not permitted."
    });
  }

  try {
    // Fetch movie details
    const movie = await req.db('basics')
      .select(
        'primaryTitle as title',
        'year',
        'runtimeMinutes as runtime',
        'genres',
        'country',
        'poster',
        'plot',
        'boxoffice'
      )
      .where('tconst', imdbID)
      .first();

    if (!movie) {
      return res.status(404).json({
        error: true,
        message: "No record exists of a movie with this ID"
      });
    }

    // Fetch principal crew
    const principals = await req.db('principals')
      .select(
        'nconst as id',
        'category',
        'name',
        'characters'
      )
      .where('tconst', imdbID);

    const formattedPrincipals = principals.map(p => ({
      ...p,
      characters: p.characters ? JSON.parse(p.characters) : []
    }));

    // Fetch ratings
    const ratings = await req.db('ratings')
      .select(
        'source',
        'value'
      )
      .where('tconst', imdbID);

    const formattedRatings = ratings.map(rating => {
      let parsedValue;
      if (rating.value.includes('/10')) {
        parsedValue = parseFloat(rating.value.split('/')[0]);
      } else if (rating.value.includes('%')) {
        parsedValue = parseInt(rating.value.replace('%', ''), 10);
      } else if (rating.value.includes('/100')) {
        parsedValue = parseInt(rating.value.split('/')[0], 10);
      } else {
        parsedValue = rating.value;
      }
      return {
        source: rating.source,
        value: parsedValue
      };
    });

    res.status(200).json({
      ...movie,
      genres: movie.genres ? movie.genres.split(',') : [],
      principals: formattedPrincipals,
      ratings: formattedRatings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: 'Database error',
      details: err.message
    });
  }
});

module.exports = router;
