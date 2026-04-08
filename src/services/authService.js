import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const login = async (email, password) => {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  const response = await axios.post(
    `${API_URL}/auth/login`,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};