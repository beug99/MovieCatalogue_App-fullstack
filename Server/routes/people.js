const express = require('express');
const router = express.Router();
const { validateToken } = require('../middleware/auth');

/**
 * @route GET /people/:id
 * @desc Retrieve person details including their roles
 * @access Protected (requires Bearer token)
 */
router.get('/:id', validateToken, async (req, res) => {
  const personId = req.params.id;

  // Validate presence of personId
  if (!personId) {
    return res.status(400).json({
      error: true,
      message: "Invalid request: person ID required."
    });
  }

  // Disallow query parameters
  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({
      error: true,
      message: "Query parameters are not permitted."
    });
  }

  try {
    // Fetch person details
    const person = await req.db('names').where({ nconst: personId }).first();
    if (!person) {
      return res.status(404).json({
        error: true,
        message: "No record exists of a person with this ID"
      });
    }

    // Construct result object
    const result = {
      name: person.primaryName,
      birthYear: person.birthYear || null,
      deathYear: person.deathYear || null,
      roles: []
    };

    // Fetch roles joined with movie basics and optional ratings
    const roles = await req.db('principals')
      .where({ 'principals.nconst': personId })
      .join('basics', 'principals.tconst', 'basics.tconst')
      .leftJoin('ratings', function() {
        this.on('basics.tconst', '=', 'ratings.tconst')
          .andOn('ratings.source', '=', req.db.raw('?', ['Internet Movie Database']));
      })
      .select(
        'basics.primaryTitle as movieName',
        'basics.tconst as movieId',
        'principals.category',
        'principals.characters',
        'ratings.value as imdbRating'
      );

    // Format roles
    result.roles = roles.map(role => ({
      movieName: role.movieName,
      movieId: role.movieId,
      category: role.category,
      characters: role.characters ? JSON.parse(role.characters) : [],
      imdbRating: role.imdbRating !== null ? parseFloat(role.imdbRating) : null
    }));

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Database error."
    });
  }
});

module.exports = router;
