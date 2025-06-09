import fs from "fs"
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


const usersResponse = await client.post(
      "https://challenge.sunvoy.com/api/users",
      null,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/json",
          "Content-Length": "0",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": "https://challenge.sunvoy.com/list"
        }
      }
    );

    if (!Array.isArray(usersResponse.data)) throw new Error("Unexpected users response");
    console.log(` Retrieved ${usersResponse.data.length} users`);

    fs.writeFileSync("output.json", JSON.stringify(usersResponse.data, null, 2));
    console.log(" Data saved to output.json");



}
catch (error) {
    console.error(" Error:", error.message || error);
  }
}

loginAndGetUsers();