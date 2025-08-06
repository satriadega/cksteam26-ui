import axios from 'axios';

const API_URL = 'http://localhost:8081';

export const getDocuments = () => {
  return axios.get(`${API_URL}/public/document?page=0`);
};
