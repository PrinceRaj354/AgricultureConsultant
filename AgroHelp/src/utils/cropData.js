// Comprehensive crop data including sowing and harvesting times
const cropData = {
  "Rice": {
    id: "rice",
    sowingTime: "June to July (Kharif), November to December (Rabi)",
    harvestingTime: "November to December (Kharif), April to May (Rabi)",
    idealTemperature: "20-35°C",
    waterRequirements: "High",
    soilTypes: "Clay or clay loam soils",
    description: "Rice is a staple food crop in many regions, preferring warm and humid conditions with adequate water supply."
  },
  "Wheat": {
    id: "wheat",
    sowingTime: "October to December",
    harvestingTime: "March to April",
    idealTemperature: "15-25°C",
    waterRequirements: "Medium",
    soilTypes: "Loam or clay loam soils with good drainage",
    description: "Wheat is a major cereal grain, grown in temperate regions and requiring moderate rainfall."
  },
  "Maize": {
    id: "maize",
    sowingTime: "June to July (Kharif), October to November (Rabi)",
    harvestingTime: "September to October (Kharif), February to March (Rabi)",
    idealTemperature: "18-27°C",
    waterRequirements: "Medium",
    soilTypes: "Well-drained loamy soils",
    description: "Maize (corn) is a versatile crop used for food, feed, and industrial purposes, requiring moderate water and nutrients."
  },
  "Cotton": {
    id: "cotton",
    sowingTime: "April to May",
    harvestingTime: "October to December",
    idealTemperature: "25-35°C",
    waterRequirements: "Medium",
    soilTypes: "Deep, well-drained soils",
    description: "Cotton is a major fiber crop that requires warm temperatures and a long frost-free period."
  },
  "Sugarcane": {
    id: "sugarcane",
    sowingTime: "February to March (Spring), October to November (Autumn)",
    harvestingTime: "December to March (after 12-18 months)",
    idealTemperature: "24-30°C",
    waterRequirements: "High",
    soilTypes: "Well-drained loamy soils with good water retention",
    description: "Sugarcane is a tropical crop requiring warm temperatures, adequate moisture, and a long growing season."
  },
  "Potato": {
    id: "potato",
    sowingTime: "October to November (Plains), March to April (Hills)",
    harvestingTime: "January to February (Plains), August to September (Hills)",
    idealTemperature: "15-20°C",
    waterRequirements: "Medium",
    soilTypes: "Well-drained, loose sandy loam",
    description: "Potatoes grow best in cool conditions and well-drained soils, avoiding extreme temperatures."
  },
  "Tomato": {
    id: "tomato",
    sowingTime: "September to October (Rabi), June to July (Kharif)",
    harvestingTime: "February to March (Rabi), October to November (Kharif)",
    idealTemperature: "20-27°C",
    waterRequirements: "Medium",
    soilTypes: "Well-drained loamy soils rich in organic matter",
    description: "Tomatoes require warm conditions, regular watering, and benefit from staking and pruning."
  },
  "Onion": {
    id: "onion",
    sowingTime: "October to November (Rabi), May to June (Kharif)",
    harvestingTime: "April to May (Rabi), November to December (Kharif)",
    idealTemperature: "13-24°C",
    waterRequirements: "Medium",
    soilTypes: "Well-drained loamy soils",
    description: "Onions prefer cooler temperatures during early growth and warmer, drier conditions during maturation."
  },
  "Chilli": {
    id: "chilli",
    sowingTime: "June to July",
    harvestingTime: "November to March",
    idealTemperature: "20-30°C",
    waterRequirements: "Medium",
    soilTypes: "Well-drained sandy loam soils",
    description: "Chillies require warm conditions, regular watering, and adequate nutrition for optimal yields."
  },
  "Mango": {
    id: "mango",
    sowingTime: "June to July (planting season)",
    harvestingTime: "April to July (depending on variety)",
    idealTemperature: "24-30°C",
    waterRequirements: "Medium",
    soilTypes: "Deep, well-drained soils",
    description: "Mango trees are tropical trees requiring warm temperatures and a distinct dry period for flowering."
  },
  "Banana": {
    id: "banana",
    sowingTime: "Year-round (preferably June to October)",
    harvestingTime: "After 10-12 months of planting",
    idealTemperature: "15-35°C",
    waterRequirements: "High",
    soilTypes: "Rich, well-drained loamy soils",
    description: "Bananas require warm temperatures, high humidity, and adequate water supply throughout their growth."
  },
  "Soybean": {
    id: "soybean",
    sowingTime: "June to July",
    harvestingTime: "October to November",
    idealTemperature: "20-30°C",
    waterRequirements: "Medium",
    soilTypes: "Well-drained loamy soils",
    description: "Soybeans prefer warm conditions and require adequate moisture especially during flowering and pod formation."
  },
  "Groundnut": {
    id: "groundnut",
    sowingTime: "June to July (Kharif), December to January (Rabi)",
    harvestingTime: "October to November (Kharif), April to May (Rabi)",
    idealTemperature: "25-30°C",
    waterRequirements: "Medium",
    soilTypes: "Well-drained sandy loam soils",
    description: "Groundnuts (peanuts) require warm temperatures and moderate rainfall for optimal yields."
  },
  "Mustard": {
    id: "mustard",
    sowingTime: "October to November",
    harvestingTime: "February to March",
    idealTemperature: "15-25°C",
    waterRequirements: "Low to Medium",
    soilTypes: "Well-drained loamy soils",
    description: "Mustard is a cool-season crop that can tolerate some drought conditions once established."
  },
  "Chickpea": {
    id: "chickpea",
    sowingTime: "October to November",
    harvestingTime: "February to March",
    idealTemperature: "20-25°C",
    waterRequirements: "Low to Medium",
    soilTypes: "Well-drained loamy soils",
    description: "Chickpeas are cool-season legumes that can fix nitrogen and improve soil fertility."
  }
};

export default cropData; 