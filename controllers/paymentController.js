import gateway from '../config/braintreeConfig.js'; // Import Braintree gateway

const getClientToken = async (req, res) => {
  try {
    const response = await gateway.clientToken.generate({});
    res.json(response.clientToken);
  } catch (error) {
    res.status(500).send(error);
  }
};

export default getClientToken; // Correctly exporting the function