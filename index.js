const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

// / Define your API key
const apiKey = '2VotOZygKGgoc2s17RTztmIt1FhtjwTphhThojGmhWU=';

// Load the JSON data
const carData = JSON.parse(fs.readFileSync('all-vehicles-model.json', 'utf8'));

const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};


// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors(corsConfig));
app.use(cors(corsConfig));

app.get('/', (req, res) => {
    res.send('Hello from CheckYourCars.com');
});

// Set up the route to handle the search request
app.get('/cars', (req, res) => {
    const make = req.query.make ? req.query.make.toLowerCase() : null;
    const model = req.query.model ? req.query.model.toLowerCase() : null;
    const year = req.query.year ? (req.query.year) : null;

    if (!make) {
        return res.status(400).json({ error: 'Make is required' });
    }

    const filteredCars = carData.filter(car => car.make.toLowerCase() === make);

    if (filteredCars.length === 0) {
        return res.status(404).json({ error: 'Make not found' });
    }

    if (model) {
        const filteredByModel = filteredCars.filter(car => car.model.toLowerCase() === model);

        if (filteredByModel.length === 0) {
            return res.status(404).json({ error: 'Model not found' });
        }

        if (year) {
            const filteredByYear = filteredByModel.filter(car => car.year === year);

            if (filteredByYear.length === 0) {
                return res.status(404).json({ error: 'Year not found' });
            }

            return res.json(filteredByYear[0]); // Assuming year will be unique for make and model
        } else {
            const years = [...new Set(filteredByModel.map(car => car.year))].sort((a, b) => a - b);
            return res.json({ make, model, years });
        }
    } else {
        const models = [...new Set(filteredCars.map(car => car.model))];
        return res.json({ make, models });
    }
});


// New route to get all unique car makes
app.get('/car-makes', (req, res) => {
    const makes = [...new Set(carData.map(car => car.make.toLowerCase()))];
    res.json({ makes });
});


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
