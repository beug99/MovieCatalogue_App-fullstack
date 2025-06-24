const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateToken, extractToken } = require('../middleware/auth');

// Constants for default token expiry times
const DEFAULT_BEARER_EXPIRY = 600;
const DEFAULT_REFRESH_EXPIRY = 86400;

/**
 * @route POST /user/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
  }

  req.db('users')
    .select('*')
    .where({ email })
    .then(rows => {
      if (rows.length !== 0) {
        return res.status(400).json({
          error: true,
          message: "Email already in use!"
        });
      }

      // Hash the password and insert the user
      bcrypt.hash(password, 10)
        .then(hash => {
          return req.db('users').insert({ email, hash });
        })
        .then(() => {
          res.status(201).json({ message: "User created" });
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({
            error: true,
            message: "Database error!"
          });
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: true,
        message: "Database error!"
      });
    });
});

/**
 * @route POST /user/login
 * @desc Authenticate user and return tokens
 * @access Public
 */
router.post('/login', (req, res) => {
  const { email, password, bearerExpiresInSeconds, refreshExpiresInSeconds } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
  }

  req.db('users').select('*').where({ email })
    .then(rows => {
      if (rows.length === 1) {
        const hash = rows[0].hash;

        bcrypt.compare(password, hash)
          .then(valid => {
            if (valid) {
              const bearerExp = parseInt(bearerExpiresInSeconds) || DEFAULT_BEARER_EXPIRY;
              const refreshExp = parseInt(refreshExpiresInSeconds) || DEFAULT_REFRESH_EXPIRY;

              const bearerToken = jwt.sign(
                { email },
                process.env.JWT_SECRET,
                { expiresIn: bearerExp }
              );

              const refreshToken = jwt.sign(
                { email },
                process.env.JWT_SECRET,
                { expiresIn: refreshExp }
              );

              return res.status(200).json({
                bearerToken: {
                  token_type: "Bearer",
                  token: bearerToken,
                  expires_in: bearerExp
                },
                refreshToken: {
                  token_type: "Refresh",
                  token: refreshToken,
                  expires_in: refreshExp
                }
              });
            } else {
              return res.status(401).json({
                error: true,
                message: "Invalid email or password"
              });
            }
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({
              error: true,
              message: "Authentication error"
            });
          });
      } else {
        return res.status(401).json({
          error: true,
          message: "Invalid email or password"
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: true,
        message: "Database error"
      });
    });
});

/**
 * @route POST /user/refresh
 * @desc Refresh bearer token using a valid refresh token
 * @access Public
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, refresh token required"
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newBearerToken = jwt.sign(
      { email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: DEFAULT_BEARER_EXPIRY }
    );

    res.status(200).json({
      bearerToken: {
        token: newBearerToken,
        token_type: "Bearer",
        expires_in: DEFAULT_BEARER_EXPIRY
      },
      refreshToken: {
        token: refreshToken,
        token_type: "Refresh",
        expires_in: DEFAULT_REFRESH_EXPIRY
      }
    });
  } catch (err) {
    const message = err.name === "TokenExpiredError"
      ? "JWT token has expired"
      : "Invalid JWT token";

    res.status(401).json({
      error: true,
      message
    });
  }
});

/**
 * @route POST /user/logout
 * @desc Invalidate refresh token (placeholder for DB blacklisting)
 * @access Public
 */
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, refresh token required"
    });
  }

  try {
    jwt.verify(refreshToken, process.env.JWT_SECRET);
    // Token blacklisting logic would go here

    res.status(200).json({
      error: false,
      message: "Token successfully invalidated"
    });
  } catch (err) {
    const message = err.name === "TokenExpiredError"
      ? "JWT token has expired"
      : "Invalid JWT token";

    res.status(401).json({
      error: true,
      message
    });
  }
});

/**
 * @route GET /user/:email/profile
 * @desc Retrieve user profile
 * @access Public (partial) / Private (full)
 */
router.get('/:email/profile', extractToken, async (req, res) => {
  const { email } = req.params;

  try {
    const user = await req.db('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found."
      });
    }

    const profile = {
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null
    };

    // Return additional details if authenticated user matches
    if (req.tokenEmail === email) {
      profile.dob = user.dob || null;
      profile.address = user.address || null;
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Database error."
    });
  }
});

/**
 * @route PUT /user/:email/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/:email/profile', extractToken, async (req, res) => {
  const { email } = req.params;

  if (!req.tokenEmail) {
    return res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found"
    });
  }

  if (req.tokenEmail !== email) {
    return res.status(403).json({
      error: true,
      message: "Forbidden"
    });
  }

  const { firstName, lastName, dob, address } = req.body;

  if (!firstName || !lastName || !dob || !address) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete: firstName, lastName, dob and address are required."
    });
  }

  if ([firstName, lastName, address].some(f => typeof f !== 'string')) {
    return res.status(400).json({
      error: true,
      message: "Request body invalid: firstName, lastName and address must be strings only."
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dob)) {
    return res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
    });
  }

  const [year, month, day] = dob.split('-').map(Number);
  const dateObj = new Date(dob);

  if (dateObj.getFullYear() !== year ||
      dateObj.getMonth() + 1 !== month ||
      dateObj.getDate() !== day) {
    return res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
    });
  }

  const today = new Date();
  const dobDate = new Date(dob);
  if (dobDate >= today) {
    return res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a date in the past."
    });
  }

  try {
    const user = await req.db('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found."
      });
    }

    await req.db('users').where({ email }).update({ firstName, lastName, dob, address });
    const updatedUser = await req.db('users').where({ email }).first();

    const dobString = updatedUser.dob
      ? new Date(updatedUser.dob).toLocaleDateString('en-CA')
      : null;

    const responseProfile = {
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      dob: dobString,
      address: updatedUser.address
    };

    res.json(responseProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: "Database error."
    });
  }
});

module.exports = router;
