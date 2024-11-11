const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/authRoutes');
require('dotenv').config();
const cors = require('cors');



const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use user routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

