import { expect } from "chai";
import { initializeTestDb, getToken } from "./helper/test.js";

describe("Testing basic database functionality", () => {
  let token = null;
  const testUser = { email: "foo3@foo.com", password: "password123" };

  before(async () => {
    await initializeTestDb();
    token = getToken(testUser.email);
  });

  it("should get all tasks", async () => {
    const response = await fetch("http://localhost:3001/");
    const data = await response.json();
    expect(response.status).to.equal(200);
    expect(data).to.be.an("array").that.is.not.empty;
    expect(data[0]).to.include.all.keys(["id", "description"]);
  });

  it("should create a new task", async () => {
    const newTask = { description: "Test task" };
    const response = await fetch("http://localhost:3001/create", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ task: newTask }),
    });

    const data = await response.json();
    expect(response.status).to.equal(201);
    expect(data).to.include.all.keys(["id", "description"]);
    expect(data.description).to.equal(newTask.description);
  });

  it("should delete task", async () => {
  const createRes = await fetch("http://localhost:3001/create", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ task: { description: "to delete" } })
  });
  const created = await createRes.json();
  const delRes = await fetch(`http://localhost:3001/delete/${created.id}`, { method: "delete" });
  const delBody = await delRes.json();
  expect(delRes.status).to.equal(200);
  expect(delBody).to.include.all.keys("id");
});


  it("should not create a new task without description", async () => {
    const response = await fetch("http://localhost:3001/create", {
      method: "post",
      headers: { 
        "Content-Type": "application/json" ,
        Authorization: token
      },
      body: JSON.stringify({ task: null }),
    });
    const data = await response.json();
    expect(response.status).to.equal(400);
    expect(data).to.include.all.keys("error");
  });
});

describe("Testing user management", () => {
  const base = Date.now();
  const user = { email: `foo${base}@test.com`, password: "password123" };

  it("should sign up", async () => {
    const response = await fetch("http://localhost:3001/user/signup", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: user })
    });
    const data = await response.json();
    expect([201, 409]).to.include(response.status);
    if (response.status === 201) {
      expect(data).to.include.all.keys(["id", "email"]);
      expect(data.email).to.equal(user.email);
    }
  });

  it("should log in", async () => {
    const response = await fetch("http://localhost:3001/user/signin", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user })
    });
    const data = await response.json();
    expect(response.status).to.equal(200);
    expect(data).to.include.all.keys(["id", "email", "token"]);
    expect(data.email).to.equal(user.email);
  });
});

