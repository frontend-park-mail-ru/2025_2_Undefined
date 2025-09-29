import { SERVER_API } from '../config.js';

class User {
  async getMe() {
    return fetch(`${SERVER_API}me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  }
}

export default new User();
