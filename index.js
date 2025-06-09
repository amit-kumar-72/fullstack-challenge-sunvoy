import os from "os"
import axios from "axios"
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const EMAIL = "demo@example.org";
const PASSWORD = "test";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

async function loginAndGetUsers() {
  try {
    const loginPage = await client.get("https://challenge.sunvoy.com/login", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const nonceMatch = loginPage.data.match(/name="nonce" value="(.+?)"/);
    if (!nonceMatch) throw new Error("CSRF token (nonce) not found");
    const nonce = nonceMatch[1];

    const loginResponse = await client.post(
      "https://challenge.sunvoy.com/login",
      new URLSearchParams({
        username: EMAIL,
        password: PASSWORD,
        nonce: nonce
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          Origin: "https://challenge.sunvoy.com",
          Referer: "https://challenge.sunvoy.com/login"
        },
        maxRedirects: 0,
        validateStatus: (status) => status === 302
      }
    );
     if (loginResponse.status !== 302) throw new Error("Login failed");
    console.log("user  Login successful");
}
catch (error) {
    console.error(" Error:", error.message || error);
  }
}

loginAndGetUsers();